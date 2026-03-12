import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(...inputs));
}

export function Card({ children, className, padding = 'md' }) {
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-theme-primary border border-theme rounded-xl shadow-sm',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-lg font-semibold text-theme-primary', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }) {
  return <div className={cn('text-theme-secondary', className)}>{children}</div>;
}
