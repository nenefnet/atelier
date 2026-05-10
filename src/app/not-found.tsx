import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-surface">
      <div className="text-center max-w-md">
        <p className="text-sm font-medium text-brand">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Page not found</h1>
        <p className="mt-3 text-ink-muted">
          The page you tried to reach doesn&rsquo;t exist, or never did.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button>Back to home</Button>
        </Link>
      </div>
    </main>
  );
}
