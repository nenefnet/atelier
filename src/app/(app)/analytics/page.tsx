import { and, asc, count, eq, gte, inArray, lt, ne } from 'drizzle-orm';
import { db } from '@/lib/db';
import { events, tasks, users } from '@/lib/db/schema';
import { requireActiveWorkspace } from '@/lib/workspace';
import { PageHeader } from '@/components/ui/page-header';
import { ActivitySparkline } from '@/components/analytics/sparkline';

export const metadata = { title: 'Analytics · Atelier' };

const DAY = 24 * 60 * 60 * 1000;

export default async function AnalyticsPage() {
  const { ws } = await requireActiveWorkspace();
  const since30 = new Date(Date.now() - 30 * DAY);
  const since7 = new Date(Date.now() - 7 * DAY);
  const now = new Date();

  const [eventRows, [{ value: openCount }], [{ value: doneLast7 }], [{ value: overdue }]] =
    await Promise.all([
      db
        .select({ name: events.name, createdAt: events.createdAt, userId: events.userId })
        .from(events)
        .where(and(eq(events.workspaceId, ws.id), gte(events.createdAt, since30)))
        .orderBy(asc(events.createdAt)),
      db
        .select({ value: count() })
        .from(tasks)
        .where(and(eq(tasks.workspaceId, ws.id), ne(tasks.status, 'done'))),
      db
        .select({ value: count() })
        .from(tasks)
        .where(
          and(
            eq(tasks.workspaceId, ws.id),
            eq(tasks.status, 'done'),
            gte(tasks.completedAt, since7),
          ),
        ),
      db
        .select({ value: count() })
        .from(tasks)
        .where(
          and(eq(tasks.workspaceId, ws.id), ne(tasks.status, 'done'), lt(tasks.dueAt, now)),
        ),
    ]);

  const completedCount = eventRows.filter((e) => e.name === 'task.completed').length;
  const createdCount = eventRows.filter((e) => e.name === 'task.created').length;

  const buckets: number[] = Array(30).fill(0);
  const startMs = Date.now() - 30 * DAY;
  for (const e of eventRows) {
    if (e.name !== 'task.completed') continue;
    const idx = Math.floor((new Date(e.createdAt).getTime() - startMs) / DAY);
    if (idx >= 0 && idx < 30) buckets[idx] += 1;
  }

  const contribMap = new Map<string, number>();
  for (const e of eventRows) {
    if (e.name !== 'task.completed' || !e.userId) continue;
    contribMap.set(e.userId, (contribMap.get(e.userId) ?? 0) + 1);
  }
  const top = [...contribMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topIds = top.map(([id]) => id);
  const profileRows =
    topIds.length > 0
      ? await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, topIds))
      : [];
  const nameById = new Map(profileRows.map((p) => [p.id, p.name]));

  return (
    <>
      <PageHeader title="Analytics" description="Last 30 days." />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Metric label="Open tasks" value={openCount} />
        <Metric label="Done · last 7d" value={doneLast7} tone="success" />
        <Metric label="Overdue" value={overdue} tone={overdue > 0 ? 'warn' : 'neutral'} />
        <Metric label="Created · 30d" value={createdCount} />
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Tasks completed</h2>
            <p className="text-xs text-ink-faint mt-0.5">
              {completedCount} completions in the last 30 days
            </p>
          </div>
        </div>
        <ActivitySparkline buckets={buckets} />
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold text-ink mb-4">Top contributors</h2>
        {top.length > 0 ? (
          <ul className="divide-y divide-border">
            {top.map(([id, c], i) => (
              <li key={id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-ink-faint w-5">#{i + 1}</span>
                  <p className="text-sm font-medium text-ink">{nameById.get(id) ?? 'Member'}</p>
                </div>
                <p className="text-sm text-ink-muted">{c} {c === 1 ? 'completion' : 'completions'}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-faint py-2">No completions yet.</p>
        )}
      </section>
    </>
  );
}

function Metric({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: number;
  tone?: 'neutral' | 'warn' | 'success';
}) {
  const valueClass =
    tone === 'warn' && value > 0
      ? 'text-warn'
      : tone === 'success'
        ? 'text-success'
        : 'text-ink';
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${valueClass}`}>{value}</p>
    </div>
  );
}
