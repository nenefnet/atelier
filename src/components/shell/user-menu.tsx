import { Avatar } from '@/components/ui/avatar';

interface Props {
  email: string | undefined | null;
  name: string | null | undefined;
  avatarUrl?: string | null;
}

export function UserMenu({ email, name, avatarUrl }: Props) {
  return (
    <div className="flex items-center gap-2.5 rounded-md border border-border bg-card px-2 py-1.5 shadow-sm">
      <Avatar name={name ?? email} src={avatarUrl} size={28} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium text-ink truncate">{name ?? email ?? 'Demo'}</span>
        <span className="text-[11px] text-ink-faint truncate">Demo workspace</span>
      </span>
    </div>
  );
}
