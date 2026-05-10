'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';
import { requireActiveWorkspace, requireMembership } from '@/lib/workspace';
import { logEvent } from './events';

const TaskStatusEnum = z.enum(['todo', 'doing', 'blocked', 'done']);
const TaskPriorityEnum = z.enum(['low', 'normal', 'high']);

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(280),
  description: z.string().max(4000).optional().nullable(),
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  dueAt: z.string().datetime().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
});

export async function createTask(formData: FormData) {
  const { user, ws } = await requireActiveWorkspace();
  const parsed = CreateTaskSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || null,
    status: formData.get('status') || undefined,
    priority: formData.get('priority') || undefined,
    dueAt: formData.get('due_at') || null,
    assigneeId: formData.get('assignee_id') || null,
    projectId: formData.get('project_id') || null,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const data = parsed.data;
  await db.insert(tasks).values({
    workspaceId: ws.id,
    createdBy: user.id,
    title: data.title,
    description: data.description ?? null,
    status: data.status ?? 'todo',
    priority: data.priority ?? 'normal',
    dueAt: data.dueAt ? new Date(data.dueAt) : null,
    assigneeId: data.assigneeId ?? null,
    projectId: data.projectId ?? null,
  });

  await logEvent('task.created', { workspaceId: ws.id });
  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  return { ok: true };
}

async function loadTaskAndAssertMember(taskId: string) {
  const [t] = await db
    .select({ id: tasks.id, workspaceId: tasks.workspaceId })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);
  if (!t) throw new Error('Task not found.');
  await requireMembership(t.workspaceId);
  return t;
}

export async function setTaskStatus(taskId: string, status: z.infer<typeof TaskStatusEnum>) {
  await loadTaskAndAssertMember(taskId);
  await db
    .update(tasks)
    .set({
      status,
      completedAt: status === 'done' ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, taskId));

  await logEvent(status === 'done' ? 'task.completed' : 'task.status_changed', { status });
  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  return { ok: true };
}

const UpdateTaskSchema = CreateTaskSchema.partial();

export async function updateTask(taskId: string, patch: z.infer<typeof UpdateTaskSchema>) {
  await loadTaskAndAssertMember(taskId);
  const parsed = UpdateTaskSchema.safeParse(patch);
  if (!parsed.success) return { error: 'Invalid input' };

  const data: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.description !== undefined) data.description = parsed.data.description;
  if (parsed.data.status !== undefined) data.status = parsed.data.status;
  if (parsed.data.priority !== undefined) data.priority = parsed.data.priority;
  if (parsed.data.dueAt !== undefined) data.dueAt = parsed.data.dueAt ? new Date(parsed.data.dueAt) : null;
  if (parsed.data.assigneeId !== undefined) data.assigneeId = parsed.data.assigneeId;
  if (parsed.data.projectId !== undefined) data.projectId = parsed.data.projectId;

  await db.update(tasks).set(data).where(eq(tasks.id, taskId));
  revalidatePath('/tasks');
  return { ok: true };
}

export async function deleteTask(taskId: string) {
  await loadTaskAndAssertMember(taskId);
  await db.delete(tasks).where(eq(tasks.id, taskId));
  await logEvent('task.deleted');
  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  return { ok: true };
}
