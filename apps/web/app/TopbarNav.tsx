'use client';

import { usePathname } from 'next/navigation';
import { Topbar } from '@/components/chrome/Topbar';
import type { Crumb } from '@/lib/types';

const USER = { name: 'Operator', clearance: 'L2 · OPS' };

function getCrumbs(pathname: string): Crumb[] {
  if (pathname.startsWith('/library')) {
    return [
      { label: 'Insight Management', href: '/upload' },
      { label: 'Library' },
    ];
  }
  if (pathname.startsWith('/upload')) {
    return [{ label: 'Insight Management' }];
  }
  if (pathname.startsWith('/chat')) {
    return [{ label: 'Assistant' }];
  }
  return [];
}

export function TopbarNav() {
  const pathname = usePathname();
  return <Topbar user={USER} crumbs={getCrumbs(pathname)} />;
}
