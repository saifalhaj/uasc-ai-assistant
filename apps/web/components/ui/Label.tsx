import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export function Label({
  tone = 'dim',
  className,
  children,
}: {
  tone?: 'dim' | 'hi' | 'red' | 'amber' | 'green' | 'bright';
  className?: string;
  children: ReactNode;
}) {
  const toneClass = {
    dim:    'text-text-dim',
    hi:     'text-text-mid',
    red:    'text-uasc-red',
    amber:  'text-uasc-amber',
    green:  'text-uasc-green',
    bright: 'text-text-hi',
  }[tone];

  return (
    <span
      className={cn(
        'font-mono text-[10px] uppercase tracking-[0.1em]',
        toneClass,
        className,
      )}
    >
      {children}
    </span>
  );
}
