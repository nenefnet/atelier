import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-brand text-white hover:bg-brand-hover shadow-sm',
        ghost: 'border border-border bg-card text-ink hover:bg-surface',
        soft: 'bg-brand-soft text-brand hover:bg-indigo-100',
        link: 'text-brand underline-offset-4 hover:underline px-0 h-auto',
        danger: 'bg-danger text-white hover:bg-rose-700 shadow-sm',
        outline: 'border border-border bg-transparent text-ink-muted hover:bg-surface hover:text-ink',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4',
        lg: 'h-10 px-5',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';

export { buttonVariants };
