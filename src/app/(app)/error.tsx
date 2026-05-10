'use client';

import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-prose rounded-lg border border-border bg-card p-8 shadow-card">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Something went wrong</h1>
      <p className="mt-3 text-ink-muted">{error.message || 'Try again, or refresh the page.'}</p>
      <div className="mt-6">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
