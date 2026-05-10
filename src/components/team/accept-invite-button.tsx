'use client';

// Real invitation acceptance was removed for the public demo deployment.
// The /invite/[token] page no longer renders this component, but the file
// exists to satisfy any lingering imports. Safe to delete manually.

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AcceptInviteButton({ token: _token }: { token: string }) {
  return (
    <Link href="/dashboard">
      <Button>Open dashboard</Button>
    </Link>
  );
}
