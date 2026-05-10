'use client';

import { useTransition } from 'react';
import { revokeInvitation } from '@/lib/actions/team';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate } from '@/lib/utils';
import type { Invitation, InvitationStatus } from '@/lib/db/schema';

const TONE: Record<InvitationStatus, 'neutral' | 'brand' | 'success' | 'warn' | 'danger'> = {
  pending: 'brand',
  accepted: 'success',
  revoked: 'neutral',
  expired: 'warn',
};

export function InvitationRow({ inv }: { inv: Invitation }) {
  const [pending, start] = useTransition();

  const onRevoke = () => {
    start(async () => {
      await revokeInvitation(inv.id);
    });
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-5 py-3 transition-opacity',
        pending && 'opacity-60',
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink truncate">{inv.email}</p>
        <p className="text-xs text-ink-faint mt-0.5">
          Invited {formatDate(inv.createdAt)} · Expires {formatDate(inv.expiresAt)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge tone={TONE[inv.status]} className="capitalize">{inv.status}</Badge>
        {inv.status === 'pending' && (
          <button
            type="button"
            onClick={onRevoke}
            disabled={pending}
            className="text-xs font-medium text-ink-faint hover:text-danger transition-colors"
          >
            Revoke
          </button>
        )}
      </div>
    </div>
  );
}
