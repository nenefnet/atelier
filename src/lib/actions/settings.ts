'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users, workspaces } from '@/lib/db/schema';
import { requireActiveWorkspace, requireUser, requireWorkspaceAdmin } from '@/lib/workspace';

const ProfileSchema = z.object({
  display_name: z.string().min(1).max(80),
});

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  const parsed = ProfileSchema.safeParse({ display_name: formData.get('display_name') });
  if (!parsed.success) return { error: 'Provide a name.' };

  await db.update(users).set({ name: parsed.data.display_name }).where(eq(users.id, user.id));
  revalidatePath('/', 'layout');
  return { ok: true };
}

const WorkspaceSchema = z.object({ name: z.string().min(1).max(80) });

export async function renameWorkspace(formData: FormData) {
  const { ws } = await requireActiveWorkspace();
  await requireWorkspaceAdmin(ws.id);
  const parsed = WorkspaceSchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) return { error: 'Provide a name.' };

  await db.update(workspaces).set({ name: parsed.data.name }).where(eq(workspaces.id, ws.id));
  revalidatePath('/', 'layout');
  return { ok: true };
}
