import { notFound } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { notes } from '@/lib/db/schema';
import { requireActiveWorkspace } from '@/lib/workspace';
import { NoteEditor } from '@/components/notes/note-editor';

export default async function NotePage({ params }: { params: { id: string } }) {
  const { ws } = await requireActiveWorkspace();

  const [note] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, params.id), eq(notes.workspaceId, ws.id)))
    .limit(1);

  if (!note) notFound();

  return <NoteEditor note={note} />;
}
