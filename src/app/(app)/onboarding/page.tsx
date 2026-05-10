import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Welcome · Atelier' };

export default function OnboardingPage() {
  return (
    <div className="max-w-prose mx-auto rounded-lg border border-border bg-card p-8 shadow-card">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        You don&rsquo;t have a workspace yet.
      </h1>
      <p className="mt-3 text-ink-muted leading-relaxed">
        New accounts get one automatically. If you&rsquo;re seeing this page, ask whoever invited
        you for a fresh link, or sign in again.
      </p>
      <div className="mt-6">
        <Link href="/login">
          <Button>Back to sign in</Button>
        </Link>
      </div>
    </div>
  );
}
