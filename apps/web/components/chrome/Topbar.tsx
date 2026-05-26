'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { Dot } from '@/components/ui/Dot';
import { Crumbs } from '@/components/ui/Crumbs';
import { Clearance } from '@/components/ui/Clearance';
import type { Crumb, User } from '@/lib/types';

function useGstClock() {
  const [t, setT] = useState(() => formatTime(new Date()));
  useEffect(() => {
    const iv = setInterval(() => setT(formatTime(new Date())), 1000);
    return () => clearInterval(iv);
  }, []);
  return t;
}

function formatTime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function Topbar({
  user,
  crumbs,
  systemsTone = 'green',
  systemsLabel = 'Systems Online',
  date,
}: {
  user: User;
  crumbs: Crumb[];
  systemsTone?: 'green' | 'amber' | 'red';
  systemsLabel?: string;
  date?: string;
}) {
  const time = useGstClock();
  const displayDate = date ?? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <header
      className={cn(
        'flex items-center gap-[18px] px-5',
        'border-b border-border-base bg-bg-deep',
      )}
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-text-mid font-medium">
        <Dot tone={systemsTone} live />
        <span>{systemsLabel}</span>
      </div>

      <div className="flex items-baseline gap-3 text-[11px]">
        <span className="font-mono text-text-hi font-medium">{time} GST</span>
        <span className="font-mono text-text-dim">{displayDate}</span>
      </div>

      <Crumbs items={crumbs} />

      <div className="ml-auto flex items-center gap-3">
        <span className="text-[12px] text-text-mid">{user.name}</span>
        <Clearance level={user.clearance} />
      </div>
    </header>
  );
}
