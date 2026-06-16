import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const variants = {
  default:
    'bg-accent text-background hover:bg-accent-hover focus-visible:ring-accent disabled:opacity-50',
  ghost:
    'bg-transparent text-foreground hover:bg-background-elevated focus-visible:ring-border',
  outline:
    'bg-transparent text-foreground border border-border hover:border-accent hover:text-accent focus-visible:ring-accent',
  destructive:
    'bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25 focus-visible:ring-danger',
} as const;

const sizes = {
  sm: 'h-7 px-2.5 text-xs',
  md: 'h-9 px-3.5 text-sm',
  lg: 'h-10 px-4 text-sm',
} as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
