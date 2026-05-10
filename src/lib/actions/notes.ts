'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { notes } from '@/lib/db/schema';
import { requireActiveWorkspace, requireMembership } from '@/lib/workspace';
import { logEvent } from './events';

export async function createNote() {
  const { user, ws } = await requireActiveWorkspace();
  const [created] = await db
    .insert(notes)
    .values({
      workspaceId: ws.id,
      createdBy: user.id,
      title: 'Untitled',
      body: '',
    })
    .returning({ id: notes.id });

  await logEvent('note.created');
  revalidatePath('/notes');
  redirect(`/notes/${created.id}`);
}

const UpdateNoteSchema = z.object({
  title: z.string().max(280).optional(),
  body: z.string().max(50000).optional(),
});

async function loadNoteAndAssertMember(noteId: string) {
  const [n] = await db
    .select({ id: notes.id, workspaceId: notes.workspaceId })
    .from(notes)
    .where(eq(notes.id, noteId))
    .limit(1);
  if (!n) throw new Error('Note not found.');
  await requireMembership(n.workspaceId);
  return n;
}

export async function updateNote(noteId: string, patch: z.infer<typeof UpdateNoteSchema>) {
  await loadNoteAndAssertMember(noteId);
  const parsed = UpdateNoteSchema.safeParse(patch);
  if (!parsed.success) return { error: 'Invalid input' };

  await db
    .update(notes)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(notes.id, noteId));

  revalidatePath('/notes');
  revalidatePath(`/notes/${noteId}`);
  return { ok: true };
}

export async function deleteNote(noteId: string) {
  await loadNoteAndAssertMember(noteId);
  await db.delete(notes).where(eq(notes.id, noteId));
  await logEvent('note.deleted');
  revalidatePath('/notes');
  redirect('/notes');
}
