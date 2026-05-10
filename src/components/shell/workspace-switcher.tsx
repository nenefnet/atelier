'use client';

import { useState, useTransition } from 'react';
import { ChevronsUpDown, Check } from 'lucide-react';
import { setActiveWorkspace } from '@/lib/actions/auth';
import type { WorkspaceWithRole } from '@/lib/workspace';
import { cn, initials } from '@/lib/utils';

interface Props {
  workspaces: WorkspaceWithRole[];
  active: WorkspaceWithRole;
}

export function WorkspaceSwitcher({ workspaces, active }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const choose = (id: string) => {
    if (id === active.id) {
      setOpen(false);
      return;
    }
    start(async () => {
      await setActiveWorkspace(id);
      setOpen(false);
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-md border border-border bg-card px-2.5 py-2 text-left text-sm hover:bg-surface transition-colors shadow-sm"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-[11px] font-semibold text-white">
          {initials(active.name)}
        </span>
        <span className="flex flex-col min-w-0 flex-1">
          <span className="font-semibold text-ink truncate">{active.name}</span>
          <span className="text-[11px] text-ink-faint">
            {workspaces.length} {workspaces.length === 1 ? 'workspace' : 'workspaces'}
          </span>
        </span>
        <ChevronsUpDown className="h-4 w-4 text-ink-faint shrink-0" strokeWidth={2} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-20 mt-1 max-h-72 overflow-auto rounded-md border border-border bg-card shadow-pop animate-rise p-1"
        >
          {workspaces.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => choose(w.id)}
                disabled={pending}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface transition-colors',
                  w.id === active.id && 'bg-surface',
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-[10px] font-semibold text-white">
                  {initials(w.name)}
                </span>
                <span className="flex flex-col min-w-0 flex-1">
                  <span className="text-ink truncate">{w.name}</span>
                  <span className="text-[11px] text-ink-faint capitalize">{w.role}</span>
                </span>
                {w.id === active.id && <Check className="h-3.5 w-3.5 text-brand" strokeWidth={2.5} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
