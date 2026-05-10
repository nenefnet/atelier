import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { requireActiveWorkspace } from '@/lib/workspace';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateProfile, renameWorkspace } from '@/lib/actions/settings';

export const metadata = { title: 'Settings · Atelier' };

export default async function SettingsPage() {
  const { user, ws } = await requireActiveWorkspace();
  const [me] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const canRenameWorkspace = ws.role === 'owner' || ws.role === 'admin';

  return (
    <>
      <PageHeader title="Settings" description="Manage your profile and workspace." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink mb-1">Profile</h2>
          <p className="text-xs text-ink-faint mb-5">Your name as it appears to teammates.</p>
          <form action={updateProfile} className="space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-ink-muted">Display name</span>
              <Input
                name="display_name"
                defaultValue={me?.name ?? ''}
                placeholder="Your name"
                className="mt-1"
                required
              />
            </label>
            <p className="text-xs text-ink-faint">Email: {user.email}</p>
            <Button type="submit">Save changes</Button>
          </form>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink mb-1">Workspace</h2>
          <p className="text-xs text-ink-faint mb-5">Settings for {ws.name}.</p>
          <form action={renameWorkspace} className="space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-ink-muted">Name</span>
              <Input
                name="name"
                defaultValue={ws.name}
                disabled={!canRenameWorkspace}
                className="mt-1"
                required
              />
            </label>
            <p className="text-xs text-ink-faint">
              Slug: <code className="font-mono">{ws.slug}</code> · Your role: <span className="capitalize">{ws.role}</span>
            </p>
            {canRenameWorkspace ? (
              <Button type="submit">Save changes</Button>
            ) : (
              <p className="text-xs text-ink-faint">Only owners and admins can rename a workspace.</p>
            )}
          </form>
        </section>
      </div>
    </>
  );
}
