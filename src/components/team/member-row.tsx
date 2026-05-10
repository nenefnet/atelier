'use client';

import { useTransition } from 'react';
import { changeMemberRole, removeMember } from '@/lib/actions/team';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { MemberRole } from '@/lib/db/schema';

interface Props {
  member: {
    user_id: string;
    role: MemberRole;
    display_name: string | null;
    avatar_url: string | null;
    email: string | null;
  };
  isSelf: boolean;
  canManage: boolean;
}

export function MemberRow({ member, isSelf, canManage }: Props) {
  const [pending, start] = useTransition();
  const isOwner = member.role === 'owner';

  const onRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as 'admin' | 'member';
    start(async () => {
      await changeMemberRole(member.user_id, next);
    });
  };

  const onRemove = () => {
    if (!confirm(`Remove ${member.display_name ?? 'this member'} from the workspace?`)) return;
    start(async () => {
      await removeMember(member.user_id);
    });
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-5 py-3 transition-opacity',
        pending && 'opacity-60',
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={member.display_name ?? member.email} src={member.avatar_url} size={36} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink truncate">
            {member.display_name ?? member.email ?? 'Member'}
            {isSelf && <span className="text-ink-faint font-normal ml-1.5">(you)</span>}
          </p>
          {member.email && member.display_name && (
            <p className="text-xs text-ink-faint truncate">{member.email}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {isOwner ? (
          <Badge tone="brand">Owner</Badge>
        ) : canManage && !isSelf ? (
          <select
            value={member.role}
            onChange={onRoleChange}
            disabled={pending}
            className="bg-transparent text-xs font-medium text-ink-muted outline-none cursor-pointer capitalize"
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
        ) : (
          <Badge tone="neutral" className="capitalize">{member.role}</Badge>
        )}

        {canManage && !isSelf && !isOwner && (
          <button
            type="button"
            onClick={onRemove}
            disabled={pending}
            className="text-xs font-medium text-ink-faint hover:text-danger transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
