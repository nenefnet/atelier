import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { Plus } from 'lucide-react';
import { db } from '@/lib/db';
import { notes } from '@/lib/db/schema';
import { requireActiveWorkspace } from '@/lib/workspace';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import { createNote } from '@/lib/actions/notes';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'Notes · Atelier' };

export default async function NotesPage() {
  const { ws } = await requireActiveWorkspace();

  const list = await db
    .select({
      id: notes.id,
      title: notes.title,
      body: notes.body,
      updatedAt: notes.updatedAt,
    })
    .from(notes)
    .where(eq(notes.workspaceId, ws.id))
    .orderBy(desc(notes.updatedAt));

  return (
    <>
      <PageHeader
        title="Notes"
        description="Meeting notes, decisions, and shared context."
        actions={
          <form action={createNote}>
            <Button type="submit">
              <Plus className="h-4 w-4" strokeWidth={2} /> New note
            </Button>
          </form>
        }
      />

      {list.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((n) => (
            <li key={n.id}>
              <Link
                href={`/notes/${n.id}`}
                className="block h-full rounded-lg border border-border bg-card p-5 shadow-card hover:border-brand hover:shadow-pop transition-all"
              >
                <p className="text-base font-semibold text-ink truncate">{n.title}</p>
                <p className="mt-2 text-sm text-ink-muted line-clamp-3 leading-relaxed">
                  {n.body || 'Empty note.'}
                </p>
                <p className="mt-4 text-xs text-ink-faint">
                  Updated {formatDate(n.updatedAt, 'long')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Empty
          title="No notes yet"
          description="Start a note to keep track of decisions and context."
          action={
            <form action={createNote}>
              <Button type="submit">
                <Plus className="h-4 w-4" strokeWidth={2} /> New note
              </Button>
            </form>
          }
        />
      )}
    </>
  );
}
