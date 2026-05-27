'use client';

import { usePathname } from 'next/navigation';
import { Topbar } from '@/components/chrome/Topbar';
import { useAuth } from './AuthProvider';
import type { Crumb } from '@/lib/types';

const GUEST_USER = { name: '—', clearance: '—' };

function getCrumbs(pathname: string): Crumb[] {
  if (pathname.startsWith('/login')) return [{ label: 'Authentication' }];
  if (pathname.startsWith('/library')) {
    return [
      { label: 'Insight Management', href: '/upload' },
      { label: 'Library' },
    ];
  }
  if (pathname.startsWith('/upload')) return [{ label: 'Insight Management' }];
  if (pathname.startsWith('/chat'))   return [{ label: 'Assistant' }];
  if (pathname.startsWith('/help/reset')) return [{ label: 'Help' }, { label: 'Account Reset' }];
  if (pathname.startsWith('/help'))   return [{ label: 'Help' }];
  return [];
}

export function TopbarNav() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const topbarUser = loading || !user
    ? GUEST_USER
    : { name: user.displayName, clearance: user.clearanceLabel };

  return (
    <Topbar
      user={topbarUser}
      crumbs={getCrumbs(pathname)}
      onLogout={user ? logout : undefined}
    />
  );
}
