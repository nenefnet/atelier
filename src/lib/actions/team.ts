'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { invitations, workspaceMembers, workspaces } from '@/lib/db/schema';
import {
  requireActiveWorkspace,
  requireUser,
  requireWorkspaceAdmin,
} from '@/lib/workspace';
import { logEvent } from './events';

const InviteSchema = z.object({
  email: z.string().email().max(254),
  role: z.enum(['admin', 'member']),
});

export async function inviteToWorkspace(formData: FormData) {
  const { user, ws } = await requireActiveWorkspace();
  await requireWorkspaceAdmin(ws.id);

  const parsed = InviteSchema.safeParse({
    email: formData.get('email'),
    role: formData.get('role'),
  });
  if (!parsed.success) return { error: 'Provide a valid email and role.' };

  const [created] = await db
    .insert(invitations)
    .values({
      email: parsed.data.email.toLowerCase(),
      role: parsed.data.role,
      workspaceId: ws.id,
      invitedBy: user.id,
    })
    .returning({ id: invitations.id, token: invitations.token });

  await logEvent('invitation.created', { role: parsed.data.role });
  revalidatePath('/team');
  return { ok: true, inviteId: created.id, token: created.token };
}

export async function revokeInvitation(inviteId: string) {
  await requireUser();
  const [inv] = await db
    .select({ workspaceId: invitations.workspaceId })
    .from(invitations)
    .where(eq(invitations.id, inviteId))
    .limit(1);
  if (!inv) return { error: 'Invitation not found.' };
  await requireWorkspaceAdmin(inv.workspaceId);

  await db.update(invitations).set({ status: 'revoked' }).where(eq(invitations.id, inviteId));
  revalidatePath('/team');
  return { ok: true };
}

export async function changeMemberRole(userId: string, role: 'admin' | 'member') {
  const { ws } = await requireActiveWorkspace();
  await requireWorkspaceAdmin(ws.id);

  await db
    .update(workspaceMembers)
    .set({ role })
    .where(and(eq(workspaceMembers.workspaceId, ws.id), eq(workspaceMembers.userId, userId)));

  revalidatePath('/team');
  return { ok: true };
}

export async function removeMember(userId: string) {
  const { ws } = await requireActiveWorkspace();
  await requireWorkspaceAdmin(ws.id);

  if (ws.ownerId === userId) {
    return { error: "You can't remove the workspace owner." };
  }

  await db
    .delete(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, ws.id), eq(workspaceMembers.userId, userId)));

  await logEvent('member.removed');
  revalidatePath('/team');
  return { ok: true };
}

/**
 * Public-safe invitation lookup. Used by the /invite/[token] page to render
 * details without requiring admin access — exposes only minimal fields.
 */
export async function getInvitationByToken(token: string) {
  const [row] = await db
    .select({
      email: invitations.email,
      role: invitations.role,
      status: invitations.status,
      expiresAt: invitations.expiresAt,
      workspaceName: workspaces.name,
    })
    .from(invitations)
    .innerJoin(workspaces, eq(workspaces.id, invitations.workspaceId))
    .where(eq(invitations.token, token))
    .limit(1);
  return row ?? null;
}
