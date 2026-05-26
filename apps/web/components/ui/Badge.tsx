import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

type Tone = 'red' | 'amber' | 'green' | 'bright' | 'muted';

const toneClass: Record<Tone, string> = {
  red:    'text-uasc-red',
  amber:  'text-uasc-amber',
  green:  'text-uasc-green',
  bright: 'text-text-hi',
  muted:  'text-text-dim',
};

export function Badge({
  tone = 'muted',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        'font-mono text-[10px] uppercase tracking-[0.06em]',
        'px-1.5 py-[2px] border border-current rounded-sm',
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
