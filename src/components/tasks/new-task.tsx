'use client';

import { useRef, useTransition } from 'react';
import { Plus } from 'lucide-react';
import { createTask } from '@/lib/actions/tasks';

export function NewTaskInline() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();

  const onSubmit = (formData: FormData) => {
    start(async () => {
      const res = await createTask(formData);
      if (!res?.error) formRef.current?.reset();
    });
  };

  return (
    <form
      ref={formRef}
      action={onSubmit}
      className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-card focus-within:bg-surface transition-colors"
    >
      <Plus className="h-4 w-4 text-ink-faint shrink-0" strokeWidth={2} />
      <input
        name="title"
        required
        placeholder="Add a task and press Enter"
        disabled={pending}
        className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none"
        autoComplete="off"
      />
      <select
        name="priority"
        defaultValue="normal"
        className="bg-transparent text-xs font-medium text-ink-muted outline-none cursor-pointer"
      >
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
      </select>
    </form>
  );
}
