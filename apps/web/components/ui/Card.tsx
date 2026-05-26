import { cn } from '@/lib/cn';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ elevated, className, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={cn(
        'border border-border-base rounded',
        elevated ? 'bg-surf-2' : 'bg-surf-1',
        className,
      )}
    />
  );
}
