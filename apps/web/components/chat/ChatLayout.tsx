'use client';

import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export function ChatLayout({
  sidebar,
  main,
  citations,
  map,
  mapVisible = false,
}: {
  sidebar: ReactNode;
  main: ReactNode;
  citations: ReactNode;
  map?: ReactNode;
  mapVisible?: boolean;
}) {
  return (
    <div
      className={cn(
        'grid h-full',
        mapVisible
          ? 'grid-cols-[240px_minmax(0,1.05fr)_minmax(0,0.95fr)_320px]'
          : 'grid-cols-[240px_minmax(0,1fr)_320px]',
      )}
    >
      {sidebar}
      {main}
      {mapVisible && map}
      {citations}
    </div>
  );
}

export function ChatMain({
  header,
  children,
  composer,
}: {
  header?: ReactNode;
  children: ReactNode;
  composer: ReactNode;
}) {
  return (
    <section className="flex flex-col overflow-hidden bg-bg-base">
      {header && (
        <div className="px-6 py-3.5 border-b border-border-base flex items-center gap-3.5">
          {header}
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-8 pt-6 pb-3">
        <div className="max-w-[760px] mx-auto flex flex-col gap-5">
          {children}
        </div>
      </div>
      {composer}
    </section>
  );
}

export function CitationsRail({
  title = 'Sources',
  count,
  children,
  footer,
}: {
  title?: string;
  count?: number;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <aside className="border-l border-border-base bg-bg-deep flex flex-col overflow-hidden">
      <div className="px-4 py-3.5 border-b border-border-base flex items-center justify-between">
        <div className="text-[13px] font-medium text-text-hi">
          {title}{count !== undefined && ` · ${count}`}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-dim">
          cited inline
        </span>
      </div>
      <div className="overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5">
        {children}
      </div>
      {footer}
    </aside>
  );
}

export function UserMessage({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        'self-end max-w-[78%]',
        'bg-surf-2 border border-border-base rounded',
        'px-3.5 py-2.5 text-sm text-text-hi',
      )}
    >
      {children}
    </div>
  );
}
