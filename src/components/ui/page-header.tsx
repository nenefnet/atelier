import { cn } from '@/lib/utils';

interface Props {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: Props) {
  return (
    <header
      className={cn(
        'flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-8',
        className,
      )}
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-ink-muted leading-relaxed max-w-prose">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
