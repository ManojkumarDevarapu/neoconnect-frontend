import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        new: 'border-transparent bg-blue-100 text-blue-800',
        assigned: 'border-transparent bg-yellow-100 text-yellow-800',
        inprogress: 'border-transparent bg-green-100 text-green-800',
        pending: 'border-transparent bg-purple-100 text-purple-800',
        resolved: 'border-transparent bg-emerald-100 text-emerald-800',
        escalated: 'border-transparent bg-red-100 text-red-800',
        low: 'border-transparent bg-green-100 text-green-700',
        medium: 'border-transparent bg-amber-100 text-amber-700',
        high: 'border-transparent bg-red-100 text-red-700',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };