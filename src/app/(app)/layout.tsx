import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getMyWorkspaces, resolveActiveWorkspace, requireUser } from '@/lib/workspace';
import { Sidebar } from '@/components/shell/sidebar';
import { WorkspaceSwitcher } from '@/components/shell/workspace-switcher';
import { UserMenu } from '@/components/shell/user-menu';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [workspaces, active] = await Promise.all([
    getMyWorkspaces(user.id),
    resolveActiveWorkspace(user.id),
  ]);
  if (!active) redirect('/');

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr] bg-surface">
      <aside className="hidden lg:flex flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2 px-5 h-14 border-b border-border">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-base font-semibold tracking-tight text-ink"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-white text-xs font-bold">
              A
            </span>
            Atelier
          </Link>
        </div>

        <div className="px-3 pt-3">
          <WorkspaceSwitcher workspaces={workspaces} active={active} />
        </div>

        <div className="my-4 px-3">
          <p className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint mb-1">
            Workspace
          </p>
        </div>

        <div className="flex-1 overflow-y-auto pb-3">
          <Sidebar />
        </div>

        <div className="p-3 border-t border-border">
          <UserMenu name={user.name} email={user.email} />
        </div>
      </aside>

      <main className="min-w-0 px-6 py-8 md:px-10 md:py-10 max-w-page w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
