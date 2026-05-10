'use client';

import { useState, useTransition } from 'react';
import { Copy, Check } from 'lucide-react';
import { inviteToWorkspace } from '@/lib/actions/team';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

export function InviteForm() {
  const [pending, start] = useTransition();
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (formData: FormData) => {
    setError(null);
    setLink(null);
    start(async () => {
      const res = await inviteToWorkspace(formData);
      if (res?.error) setError(res.error);
      else if (res?.token) {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        setLink(`${origin}/invite/${res.token}`);
      }
    });
  };

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-card">
      <h3 className="text-sm font-semibold text-ink">Invite a teammate</h3>
      <p className="text-sm text-ink-muted mt-1 mb-4">
        Send an invite by email — copy the link and share it however you like.
      </p>

      <form action={onSubmit} className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-2">
        <Input type="email" name="email" placeholder="teammate@company.com" required />
        <Select name="role" defaultValue="member">
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </Select>
        <Button type="submit" disabled={pending}>
          {pending ? 'Inviting…' : 'Send invite'}
        </Button>
      </form>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {link && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
          <code className="text-xs text-ink truncate flex-1 font-mono">{link}</code>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-ink"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" strokeWidth={2} /> Copy
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
