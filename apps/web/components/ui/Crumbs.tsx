import { cn } from '@/lib/cn';
import type { Crumb } from '@/lib/types';
import { Fragment } from 'react';

export function Crumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-text-dim',
        className,
      )}
    >
      {items.map((c, i) => {
        const isLast = i === items.length - 1;
        return (
          <Fragment key={i}>
            {i > 0 && <span className="text-text-faint">›</span>}
            <span className={isLast ? 'text-text-hi' : ''}>{c.label}</span>
          </Fragment>
        );
      })}
    </nav>
  );
}
