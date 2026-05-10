import { cn } from '@/lib/utils';

interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function Empty({ title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6 border-2 border-dashed border-border rounded-lg bg-surface',
        className,
      )}
    >
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
