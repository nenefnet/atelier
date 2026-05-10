import { and, desc, eq, ne } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tasks, workspaceMembers, users } from '@/lib/db/schema';
import { requireActiveWorkspace } from '@/lib/workspace';
import { PageHeader } from '@/components/ui/page-header';
import { Empty } from '@/components/ui/empty';
import { NewTaskInline } from '@/components/tasks/new-task';
import { TaskRow } from '@/components/tasks/task-row';

export const metadata = { title: 'Tasks · Atelier' };

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const { ws } = await requireActiveWorkspace();

  const conditions = [eq(tasks.workspaceId, ws.id)];
  if (searchParams.status === 'open') conditions.push(ne(tasks.status, 'done'));
  else if (searchParams.status === 'done') conditions.push(eq(tasks.status, 'done'));

  const taskList = await db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(desc(tasks.createdAt));

  const memberRows = await db
    .select({
      userId: workspaceMembers.userId,
      name: users.name,
      image: users.image,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(users.id, workspaceMembers.userId))
    .where(eq(workspaceMembers.workspaceId, ws.id));

  const members = memberRows.map((m) => ({
    user_id: m.userId,
    display_name: m.name,
    avatar_url: m.image,
  }));

  return (
    <>
      <PageHeader title="Tasks" description="Track work across your team." />

      <div className="flex items-center gap-1 mb-4 border-b border-border">
        <FilterTab current={searchParams.status} value={undefined} label="All" />
        <FilterTab current={searchParams.status} value="open" label="Open" />
        <FilterTab current={searchParams.status} value="done" label="Done" />
      </div>

      <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
        <NewTaskInline />

        {taskList.length === 0 ? (
          <div className="p-6">
            <Empty
              title="No tasks yet"
              description="Add one above to get started — Enter to save."
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr className="text-xs font-medium text-ink-muted">
                <th className="w-10 pl-4 py-2.5"></th>
                <th className="text-left py-2.5 px-2">Title</th>
                <th className="text-left py-2.5 px-2 w-32">Status</th>
                <th className="text-left py-2.5 px-2 w-28">Priority</th>
                <th className="text-left py-2.5 px-2 w-44">Assignee</th>
                <th className="text-left py-2.5 px-2 w-24">Due</th>
                <th className="w-10 pr-2"></th>
              </tr>
            </thead>
            <tbody>
              {taskList.map((t) => (
                <TaskRow key={t.id} task={t} members={members} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function FilterTab({
  current,
  value,
  label,
}: {
  current: string | undefined;
  value: string | undefined;
  label: string;
}) {
  const active = (current ?? undefined) === value;
  const href = value ? `/tasks?status=${value}` : '/tasks';
  return (
    <a
      href={href}
      className={
        active
          ? 'inline-flex h-9 items-center px-3 text-sm font-medium text-brand border-b-2 border-brand -mb-px'
          : 'inline-flex h-9 items-center px-3 text-sm font-medium text-ink-muted hover:text-ink'
      }
    >
      {label}
    </a>
  );
}
