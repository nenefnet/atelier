'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { setTaskStatus, deleteTask, updateTask } from '@/lib/actions/tasks';
import type { Task, TaskStatus, TaskPriority } from '@/lib/db/schema';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate } from '@/lib/utils';

interface Member {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface Props {
  task: Task;
  members: Member[];
}

const STATUS_TONE: Record<TaskStatus, 'neutral' | 'brand' | 'warn' | 'success'> = {
  todo: 'neutral',
  doing: 'brand',
  blocked: 'warn',
  done: 'success',
};

export function TaskRow({ task, members }: Props) {
  const [pending, start] = useTransition();
  const assignee = members.find((m) => m.user_id === task.assigneeId);

  const toggleDone = () => {
    start(async () => {
      await setTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done');
    });
  };

  const onChangeStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as TaskStatus;
    start(async () => {
      await setTaskStatus(task.id, next);
    });
  };

  const onChangePriority = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as TaskPriority;
    start(async () => {
      await updateTask(task.id, { priority: next });
    });
  };

  const onChangeAssignee = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value || null;
    start(async () => {
      await updateTask(task.id, { assigneeId: next });
    });
  };

  const onDelete = () => {
    if (!confirm('Delete this task?')) return;
    start(async () => {
      await deleteTask(task.id);
    });
  };

  return (
    <tr
      className={cn(
        'group border-t border-border hover:bg-surface transition-colors',
        pending && 'opacity-60',
      )}
    >
      <td className="pl-4 pr-2 py-2.5 align-middle">
        <input
          type="checkbox"
          checked={task.status === 'done'}
          onChange={toggleDone}
          aria-label={`Mark "${task.title}" as ${task.status === 'done' ? 'open' : 'done'}`}
          className="h-4 w-4 rounded border-border-strong text-brand focus:ring-brand-ring cursor-pointer"
        />
      </td>
      <td className="px-2 py-2.5 align-middle">
        <p className={cn('text-sm font-medium text-ink truncate max-w-md', task.status === 'done' && 'line-through text-ink-muted')}>
          {task.title}
        </p>
      </td>
      <td className="px-2 py-2.5 align-middle">
        <Badge tone={STATUS_TONE[task.status]} className="capitalize">
          <select
            value={task.status}
            onChange={onChangeStatus}
            disabled={pending}
            className="bg-transparent text-xs font-medium outline-none cursor-pointer appearance-none"
          >
            <option value="todo">Todo</option>
            <option value="doing">Doing</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </select>
        </Badge>
      </td>
      <td className="px-2 py-2.5 align-middle">
        <select
          value={task.priority}
          onChange={onChangePriority}
          disabled={pending}
          className="bg-transparent text-xs font-medium text-ink-muted outline-none cursor-pointer capitalize"
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
      </td>
      <td className="px-2 py-2.5 align-middle">
        <div className="flex items-center gap-2">
          {assignee && <Avatar name={assignee.display_name} src={assignee.avatar_url} size={22} />}
          <select
            value={task.assigneeId ?? ''}
            onChange={onChangeAssignee}
            disabled={pending}
            className="bg-transparent text-xs text-ink-muted outline-none cursor-pointer max-w-[140px]"
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.display_name ?? 'Member'}
              </option>
            ))}
          </select>
        </div>
      </td>
      <td className="px-2 py-2.5 align-middle text-xs text-ink-muted">{formatDate(task.dueAt)}</td>
      <td className="pr-3 py-2.5 align-middle">
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          aria-label="Delete task"
          className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-danger transition-opacity p-1 rounded"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2} />
        </button>
      </td>
    </tr>
  );
}
