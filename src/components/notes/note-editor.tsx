'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { updateNote, deleteNote } from '@/lib/actions/notes';
import type { Note } from '@/lib/db/schema';
import { formatDate } from '@/lib/utils';

interface Props {
  note: Note;
}

export function NoteEditor({ note }: Props) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [savedAt, setSavedAt] = useState<Date | null>(new Date(note.updatedAt));
  const [pending, start] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (title === note.title && body === note.body) return;
    timer.current = setTimeout(() => {
      start(async () => {
        const res = await updateNote(note.id, { title, body });
        if (!res?.error) setSavedAt(new Date());
      });
    }, 700);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body]);

  const onDelete = () => {
    if (!confirm('Delete this note? This cannot be undone.')) return;
    start(async () => {
      await deleteNote(note.id);
    });
  };

  return (
    <article className="max-w-prose mx-auto">
      <header className="flex items-center justify-between mb-6">
        <Link
          href="/notes"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Back to notes
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs text-ink-faint">
            {pending ? 'Saving…' : savedAt ? `Saved ${formatDate(savedAt, 'long')}` : ''}
          </span>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1 text-xs font-medium text-ink-faint hover:text-danger transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} /> Delete
          </button>
        </div>
      </header>

      <div className="rounded-lg border border-border bg-card p-8 shadow-card">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="w-full bg-transparent text-3xl font-semibold tracking-tight text-ink placeholder:text-ink-faint outline-none mb-4"
        />

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start writing…"
          className="w-full min-h-[55vh] resize-none bg-transparent text-base leading-relaxed text-ink placeholder:text-ink-faint outline-none"
        />
      </div>
    </article>
  );
}
