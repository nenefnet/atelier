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
 *
 * Race-safe: every insert uses ON CONFLICT DO NOTHING so concurrent serverless
 * cold-start requests can run this simultaneously without unique-constraint
 * crashes. Seed-data inserts run only on the request that actually created the
 * workspace row.
 */
async function ensureDemoSetup(): Promise<{ id: string; email: string; name: string }> {
  // 1. Demo user — try insert, ignore if already exists, then re-select.
  await db
    .insert(users)
    .values({ email: DEMO_EMAIL, name: DEMO_NAME })
    .onConflictDoNothing();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, DEMO_EMAIL))
    .limit(1);

  if (!user) {
    throw new Error('Failed to load demo user');
  }

  // 2. Demo workspace — try insert; if conflict, fetch existing.
  // The .returning() result tells us whether the row was newly inserted
  // (used to decide whether to seed sample data).
  const insertedWs = await db
    .insert(workspaces)
    .values({
      name: DEMO_WORKSPACE_NAME,
      slug: DEMO_WORKSPACE_SLUG,
      ownerId: user.id,
    })
    .onConflictDoNothing()
    .returning({ id: workspaces.id });

  let workspaceId: string;
  let isNewWorkspace = false;

  if (insertedWs.length > 0) {
    workspaceId = insertedWs[0].id;
    isNewWorkspace = true;
  } else {
    const [existing] = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.slug, DEMO_WORKSPACE_SLUG))
      .limit(1);
    if (!existing) throw new Error('Failed to load demo workspace');
    workspaceId = existing.id;
  }

  // 3. Membership — composite PK so onConflictDoNothing handles dupes.
  await db
    .insert(workspaceMembers)
    .values({ workspaceId, userId: user.id, role: 'owner' })
    .onConflictDoNothing();

  // 4. Seed sample data only when this request created the workspace row.
  if (isNewWorkspace) {
    await db.insert(tasks).values([
      {
        workspaceId,
        createdBy: user.id,
        title: 'Welcome to Atelier — click around!',
        description:
          'Tasks, notes, team management, and analytics — all in one quiet workspace.',
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
