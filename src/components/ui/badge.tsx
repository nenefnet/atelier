import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      tone: {
        neutral: 'border-border bg-surface text-ink-muted',
        brand: 'border-transparent bg-brand-soft text-brand',
        success: 'border-transparent bg-success-soft text-success',
        warn: 'border-transparent bg-warn-soft text-warn',
        danger: 'border-transparent bg-danger-soft text-danger',
        solid: 'border-transparent bg-slate-900 text-white',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
