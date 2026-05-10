import { cn, initials } from '@/lib/utils';

interface Props {
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ name, src, size = 32, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand overflow-hidden ring-1 ring-border',
        className,
      )}
      style={{ width: size, height: size, minWidth: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? ''} className="h-full w-full object-cover" />
      ) : (
        <span>{initials(name)}</span>
      )}
    </span>
  );
}
