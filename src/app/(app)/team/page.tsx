import { asc, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { invitations, users, workspaceMembers } from '@/lib/db/schema';
import { requireActiveWorkspace } from '@/lib/workspace';
import { PageHeader } from '@/components/ui/page-header';
import { Empty } from '@/components/ui/empty';
import { InviteForm } from '@/components/team/invite-form';
import { MemberRow } from '@/components/team/member-row';
import { InvitationRow } from '@/components/team/invitation-row';

export const metadata = { title: 'Team · Atelier' };

export default async function TeamPage() {
  const { user, ws } = await requireActiveWorkspace();
  const canManage = ws.role === 'owner' || ws.role === 'admin';

  const memberRows = await db
    .select({
      userId: workspaceMembers.userId,
      role: workspaceMembers.role,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(users.id, workspaceMembers.userId))
    .where(eq(workspaceMembers.workspaceId, ws.id))
    .orderBy(asc(workspaceMembers.joinedAt));

  const inviteList = canManage
    ? await db
        .select()
        .from(invitations)
        .where(eq(invitations.workspaceId, ws.id))
        .orderBy(desc(invitations.createdAt))
    : [];

  const members = memberRows.map((m) => ({
    user_id: m.userId,
    role: m.role,
    display_name: m.name,
    avatar_url: m.image,
    email: m.email,
  }));

  return (
    <>
      <PageHeader title="Team" description={`Manage members and invitations for ${ws.name}.`} />

      {canManage && (
        <div className="mb-8">
          <InviteForm />
        </div>
      )}

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-ink">Members</h2>
          <span className="text-xs text-ink-faint">
            {members.length} {members.length === 1 ? 'person' : 'people'}
          </span>
        </div>
        <div className="rounded-lg border border-border bg-card divide-y divide-border shadow-card">
          {members.map((m) => (
            <MemberRow
              key={m.user_id}
              member={m}
              isSelf={m.user_id === user.id}
              canManage={canManage}
            />
          ))}
        </div>
      </section>

      {canManage && (
        <section>
          <h2 className="text-base font-semibold text-ink mb-3">Invitations</h2>
          {inviteList.length > 0 ? (
            <div className="rounded-lg border border-border bg-card divide-y divide-border shadow-card">
              {inviteList.map((inv) => (
                <InvitationRow key={inv.id} inv={inv} />
              ))}
            </div>
          ) : (
            <Empty title="No pending invitations" description="Invite a teammate above." />
          )}
        </section>
      )}
    </>
  );
}
