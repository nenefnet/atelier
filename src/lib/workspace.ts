import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { and, asc, eq } from 'drizzle-orm';
import { db } from './db';
import {
  users,
  workspaces,
  workspaceMembers,
  tasks,
  notes,
  type Workspace,
  type MemberRole,
} from './db/schema';

export const ACTIVE_WORKSPACE_COOKIE = 'atelier_workspace';

const DEMO_EMAIL = 'demo@atelier.local';
const DEMO_NAME = 'Demo User';
const DEMO_WORKSPACE_NAME = 'Demo Workspace';
const DEMO_WORKSPACE_SLUG = 'demo';

/**
 * Look up — or create on first visit — the shared demo user, workspace, and
 * a small amount of seed data so visitors see a populated dashboard.
 */
async function ensureDemoSetup(): Promise<{ id: string; email: string; name: string }> {
  // 1. Demo user
  let user = (await db.select().from(users).where(eq(users.email, DEMO_EMAIL)).limit(1))[0];
  if (!user) {
    [user] = await db
      .insert(users)
      .values({ email: DEMO_EMAIL, name: DEMO_NAME })
      .returning();
  }

  // 2. Demo workspace + membership
  const memberships = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, user.id))
    .limit(1);

  let workspaceId: string;
  let isNewWorkspace = false;

  if (memberships.length > 0) {
    workspaceId = memberships[0].workspaceId;
  } else {
    // Find or create the demo workspace
    const existingWs = (
      await db.select().from(workspaces).where(eq(workspaces.slug, DEMO_WORKSPACE_SLUG)).limit(1)
    )[0];
    if (existingWs) {
      workspaceId = existingWs.id;
    } else {
      const [created] = await db
        .insert(workspaces)
        .values({ name: DEMO_WORKSPACE_NAME, slug: DEMO_WORKSPACE_SLUG, ownerId: user.id })
        .returning({ id: workspaces.id });
      workspaceId = created.id;
      isNewWorkspace = true;
    }
    await db.insert(workspaceMembers).values({
      workspaceId,
      userId: user.id,
      role: 'owner',
    });
  }

  // 3. Seed sample data on a brand-new demo workspace
  if (isNewWorkspace) {
    await db.insert(tasks).values([
      {
        workspaceId,
        createdBy: user.id,
        title: 'Welcome to Atelier — click around!',
        description: 'Tasks, notes, team management, and analytics — all in one quiet workspace.',
        status: 'doing',
        priority: 'high',
      },
      {
        workspaceId,
        createdBy: user.id,
        title: 'Try editing the status or priority',
        status: 'todo',
        priority: 'normal',
      },
      {
        workspaceId,
        createdBy: user.id,
        title: 'Add a new task using the box at the top',
        status: 'todo',
        priority: 'normal',
      },
      {
        workspaceId,
        createdBy: user.id,
        title: 'Check the analytics page',
        status: 'todo',
        priority: 'low',
      },
      {
        workspaceId,
        createdBy: user.id,
        title: 'Drafted the v2 roadmap',
        status: 'done',
        priority: 'normal',
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ]);

    await db.insert(notes).values([
      {
        workspaceId,
        createdBy: user.id,
        title: 'Welcome',
        body: 'Notes are auto-saved as you type. Try editing this title or body — changes save in the background.\n\nUse notes for meeting context, decisions, or anything that doesn’t belong in a task.',
      },
      {
        workspaceId,
        createdBy: user.id,
        title: 'Q3 planning',
        body: 'Themes for Q3:\n\n1. Performance — reduce p95 dashboard load to < 600ms\n2. Mobile — better task editing on small screens\n3. Integrations — Slack notifications and calendar sync\n\nDecisions pending: pricing tier rework, team size limits.',
      },
    ]);
  }

  return { id: user.id, email: user.email!, name: user.name ?? DEMO_NAME };
}

export async function getCurrentUser() {
  return ensureDemoSetup();
}

export async function requireUser() {
  return ensureDemoSetup();
}

export type WorkspaceWithRole = Workspace & { role: MemberRole };

export async function getMyWorkspaces(userId: string): Promise<WorkspaceWithRole[]> {
  const rows = await db
    .select({
      workspace: workspaces,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, userId))
    .orderBy(asc(workspaceMembers.joinedAt));

  return rows.map((r) => ({ ...r.workspace, role: r.role as MemberRole }));
}

export async function resolveActiveWorkspace(userId: string): Promise<WorkspaceWithRole | null> {
  const list = await getMyWorkspaces(userId);
  if (list.length === 0) return null;

  const preferred = cookies().get(ACTIVE_WORKSPACE_COOKIE)?.value;
  return (preferred && list.find((w) => w.id === preferred)) || list[0];
}

export async function requireActiveWorkspace() {
  const user = await requireUser();
  const ws = await resolveActiveWorkspace(user.id);
  if (!ws) redirect('/');
  return { user, ws };
}

/** Throws if the user is not a member. Use as the authorization check inside server actions. */
export async function requireMembership(workspaceId: string) {
  const user = await requireUser();
  const [row] = await db
    .select({ role: workspaceMembers.role })
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, user.id)))
    .limit(1);

  if (!row) {
    throw new Error('Not a member of this workspace.');
  }
  return { user, role: row.role as MemberRole };
}

export async function requireWorkspaceAdmin(workspaceId: string) {
  const m = await requireMembership(workspaceId);
  if (m.role !== 'owner' && m.role !== 'admin') {
    throw new Error('Only owners and admins can perform this action.');
  }
  return m;
}
