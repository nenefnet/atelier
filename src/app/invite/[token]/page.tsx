import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getInvitationByToken } from '@/lib/actions/team';

export const metadata = { title: 'Invitation · Atelier' };

export default async function AcceptInvitePage({ params }: { params: { token: string } }) {
  const invitation = await getInvitationByToken(params.token);

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-surface">
      <div className="w-full max-w-md text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-semibold tracking-tight text-ink"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white text-sm font-bold">
            A
          </span>
          Atelier
        </Link>

        <div className="mt-8 rounded-xl border border-border bg-card p-8 shadow-card">
          {!invitation ? (
            <>
              <h1 className="text-xl font-semibold tracking-tight text-ink">
                Invitation not found
              </h1>
              <p className="mt-2 text-sm text-ink-muted">
                The link may have expired.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold tracking-tight text-ink">
                {invitation.workspaceName}
              </h1>
              <p className="mt-2 text-sm text-ink-muted">
                This is a demo deployment, so invites aren&rsquo;t actually accepted — but the
                feature works the same way in a real install. Open the dashboard to keep poking
                around.
              </p>
            </>
          )}

          <Link href="/dashboard" className="mt-6 inline-block">
            <Button>Open the dashboard</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
