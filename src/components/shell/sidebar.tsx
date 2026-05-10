'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListChecks, NotebookText, Users, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', Icon: ListChecks },
  { href: '/notes', label: 'Notes', Icon: NotebookText },
  { href: '/team', label: 'Team', Icon: Users },
  { href: '/analytics', label: 'Analytics', Icon: BarChart3 },
  { href: '/settings', label: 'Settings', Icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-3" aria-label="Primary">
      {NAV.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-brand-soft text-brand'
                : 'text-ink-muted hover:bg-surface hover:text-ink',
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4 shrink-0',
                active ? 'text-brand' : 'text-ink-faint group-hover:text-ink-muted',
              )}
              strokeWidth={2}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
