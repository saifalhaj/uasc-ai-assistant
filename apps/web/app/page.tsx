'use client';

import { useAuth } from './AuthProvider';
import { LandingHero } from '@/components/landing/LandingHero';

export default function Home() {
  const { user, loading } = useAuth();

  // L3+ can access Insight Management (upload + library)
  const canManageInsights = !loading && !!user && user.level !== 'L2';

  return (
    <LandingHero
      primary={{ label: 'Launch Assistant', href: '/chat' }}
      secondary={canManageInsights ? { label: 'Insight Management', href: '/upload' } : undefined}
      capabilities={[
        {
          category: 'OPS',
          title: 'Operational Briefing',
          description: 'Instant summaries of missions, incidents, DroneBox activity, airspace updates, and operational events across all autonomous systems.',
          href: '/chat?prompt=operational+briefing',
        },
        {
          category: 'RISK',
          title: 'Safety & Risk Intelligence',
          description: 'Consolidated safety reports, investigations, system failures, operational hazards, and recurring risk pattern analysis.',
          href: '/chat?prompt=safety+risk',
        },
        {
          category: 'TECH',
          title: 'Technical Support & Maintenance',
          description: 'Technical troubleshooting, maintenance procedures, fault history, downtime analysis, and field support guidance.',
          href: '/chat?prompt=technical+support',
        },
        {
          category: 'SOP',
          title: 'Training & SOP Knowledge',
          description: 'Access SOPs, training material, operator guidance, review content, procedures, and mission execution instructions.',
          href: '/chat?prompt=sop+training',
        },
      ]}
    />
  );
}
