import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { and, asc, count, desc, eq, isNotNull, lte, ne } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tasks, notes, workspaceMembers } from '@/lib/db/schema';
import { requireActiveWorkspace } from '@/lib/workspace';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default async function DashboardPage() {
  const { user, ws } = await requireActiveWorkspace();
  const inAWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [recent, dueSoon, recentNotes, [{ value: openCount }], [{ value: memberCount }]] =
    await Promise.all([
      db
        .select({
          id: tasks.id,
          title: tasks.title,
          status: tasks.status,
          priority: tasks.priority,
          dueAt: tasks.dueAt,
        })
        .from(tasks)
        .where(and(eq(tasks.workspaceId, ws.id), ne(tasks.status, 'done')))
        .orderBy(desc(tasks.updatedAt))
        .limit(6),
      db
        .select({ id: tasks.id, title: tasks.title, dueAt: tasks.dueAt, status: tasks.status })
        .from(tasks)
        .where(
          and(
            eq(tasks.workspaceId, ws.id),
            ne(tasks.status, 'done'),
            isNotNull(tasks.dueAt),
            lte(tasks.dueAt, inAWeek),
          ),
        )
        .orderBy(asc(tasks.dueAt))
        .limit(5),
      db
        .select({ id: notes.id, title: notes.title, updatedAt: notes.updatedAt })
        .from(notes)
        .where(eq(notes.workspaceId, ws.id))
        .orderBy(desc(notes.updatedAt))
        .limit(4),
      db
        .select({ value: count() })
        .from(tasks)
        .where(and(eq(tasks.workspaceId, ws.id), ne(tasks.status, 'done'))),
      db
        .select({ value: count() })
        .from(workspaceMembers)
        .where(eq(workspaceMembers.workspaceId, ws.id)),
    ]);

  const greeting = user.name ? `Hi, ${user.name.split(' ')[0]}` : 'Welcome back';

  return (
    <>
      <PageHeader
        title={greeting}
        description={`Here's what's happening in ${ws.name} today.`}
      />

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Open tasks" value={openCount} />
        <Stat label="Due this week" value={dueSoon.length} tone={dueSoon.length > 0 ? 'warn' : 'neutral'} />
        <Stat label="Team members" value={memberCount} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent activity" href="/tasks" />
          {recent.length > 0 ? (
            <ul className="divide-y divide-border">
              {recent.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{t.title}</p>
                    <p className="text-xs text-ink-faint mt-0.5">
                      {t.dueAt ? `Due ${formatDate(t.dueAt)}` : 'No due date'}
                    </p>
                  </div>
                  <Badge tone={statusTone(t.status)} className="capitalize">
                    {t.status}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-faint py-4">Nothing in motion right now.</p>
          )}
        </Card>

        <Card>
          <CardHeader title="Notes" href="/notes" />
          {recentNotes.length > 0 ? (
            <ul className="space-y-1.5">
              {recentNotes.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/notes/${n.id}`}
                    className="block rounded-md px-2 py-1.5 hover:bg-surface transition-colors -mx-2"
                  >
                    <p className="text-sm font-medium text-ink truncate">{n.title}</p>
                    <p className="text-[11px] text-ink-faint mt-0.5">
                      Updated {formatDate(n.updatedAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-faint py-2">No notes yet.</p>
          )}
        </Card>
      </div>
    </>
  );
}

function statusTone(status: string): 'neutral' | 'brand' | 'warn' | 'success' {
  if (status === 'doing') return 'brand';
  if (status === 'blocked') return 'warn';
  if (status === 'done') return 'success';
  return 'neutral';
}

function Stat({ label, value, tone = 'neutral' }: { label: string; value: number; tone?: 'neutral' | 'warn' }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-card">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p
        className={
          tone === 'warn' && value > 0
            ? 'mt-2 text-3xl font-semibold tracking-tight text-warn'
            : 'mt-2 text-3xl font-semibold tracking-tight text-ink'
        }
      >
        {value}
      </p>
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-border bg-card p-5 shadow-card ${className}`}>
      {children}
    </section>
  );
}

function CardHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover"
      >
        View all <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
      </Link>
    </div>
  );
}
