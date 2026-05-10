'use client';

import { useState, useTransition } from 'react';
import { acceptInvitation } from '@/lib/actions/team';
import { Button } from '@/components/ui/button';

export function AcceptInviteButton({ token }: { token: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onAccept = () => {
    setError(null);
    start(async () => {
      const res = await acceptInvitation(token);
      if (res?.error) setError(res.error);
    });
  };

  return (
    <div className="space-y-3">
      <Button onClick={onAccept} disabled={pending} className="w-full">
        {pending ? 'Joining…' : 'Accept invitation'}
      </Button>
      {error && (
        <p className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
