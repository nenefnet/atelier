import Link from 'next/link';
import { ArrowRight, CheckCircle2, Users, BarChart3, NotebookText } from 'lucide-react';

export default function Landing() {
  return (
    <main className="min-h-screen bg-bg">
      <header className="flex items-center justify-between max-w-page mx-auto px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight text-ink">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-white text-xs font-bold">
            A
          </span>
          Atelier
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-ink px-4 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
        >
          Open dashboard <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </Link>
      </header>

      <section className="max-w-page mx-auto px-6 pt-16 md:pt-24 pb-24 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-ink-muted shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          A productivity workspace for small teams
        </div>
        <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight text-ink max-w-3xl mx-auto leading-[1.05]">
          Tasks, notes, and analytics for your team — without the bloat.
        </h1>
        <p className="mt-5 text-lg text-ink-muted max-w-prose mx-auto leading-relaxed">
          Atelier is a focused, full-stack productivity dashboard. Built with Next.js, Drizzle, and
          SQLite via Turso.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center gap-1.5 rounded-md bg-brand px-6 text-sm font-medium text-white hover:bg-brand-hover transition-colors shadow-sm"
          >
            Open the demo <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
          <a
            href="#features"
            className="inline-flex h-11 items-center rounded-md border border-border bg-card px-6 text-sm font-medium text-ink hover:bg-surface transition-colors shadow-sm"
          >
            See features
          </a>
        </div>
      </section>

      <section
        id="features"
        className="max-w-page mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            Icon: CheckCircle2,
            t: 'Task management',
            d: 'Editorial-quality data tables with status, priority, assignees, and keyboard shortcuts.',
          },
          {
            Icon: NotebookText,
            t: 'Shared notes',
            d: 'Auto-saving notes scoped to your workspace, perfect for meeting context.',
          },
          {
            Icon: Users,
            t: 'Team & invites',
            d: 'Invite teammates by email, manage roles, and revoke access in one click.',
          },
          {
            Icon: BarChart3,
            t: 'Analytics',
            d: 'Honest metrics framed as decisions — no vanity counters.',
          },
        ].map((f) => (
          <div
            key={f.t}
            className="rounded-lg border border-border bg-card p-5 shadow-card hover:shadow-pop hover:border-brand transition-all"
          >
            <f.Icon className="h-5 w-5 text-brand mb-3" strokeWidth={2} />
            <h3 className="text-base font-semibold text-ink">{f.t}</h3>
            <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">{f.d}</p>
          </div>
        ))}
      </section>

      <section className="max-w-page mx-auto px-6 pb-24">
        <div className="rounded-xl border border-border bg-card p-8 md:p-12 shadow-card text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">
            Take a look around.
          </h2>
          <p className="mt-3 text-ink-muted max-w-prose mx-auto">
            This is a public demo. Click in, edit anything you want — the data lives in a shared
            workspace.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex h-11 items-center gap-1.5 rounded-md bg-brand px-6 text-sm font-medium text-white hover:bg-brand-hover transition-colors shadow-sm"
          >
            Open the demo <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border max-w-page mx-auto px-6 py-8 flex items-center justify-between text-sm text-ink-faint">
        <span>© Atelier · {new Date().getFullYear()}</span>
        <Link href="/dashboard" className="hover:text-ink">Open dashboard</Link>
      </footer>
    </main>
  );
}
