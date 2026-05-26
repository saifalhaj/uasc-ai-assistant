'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { CapabilityCard, type CapabilityCardProps } from '@/components/landing/CapabilityCard';

export interface LandingHeroProps {
  logoSrc?: string;
  title?: string;
  subtitle?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  capabilities: CapabilityCardProps[];
}

export function LandingHero({
  logoSrc = '/UASCLogoWhite.png',
  title = 'Operational Intelligence Assistant',
  subtitle = 'UASC · Dubai Police',
  primary,
  secondary,
  capabilities,
}: LandingHeroProps) {
  return (
    <section className="grid place-items-center min-h-full overflow-auto px-5 py-10">
      <div className="w-full max-w-[980px] flex flex-col items-center gap-7">
        <div className="w-[240px]">
          <Image
            src={logoSrc}
            alt="UASC"
            width={480}
            height={240}
            className="w-full h-auto block"
            priority
            unoptimized
          />
        </div>

        <div className="text-center">
          <h1 className="text-[28px] font-medium tracking-[-0.01em] text-text-hi m-0">
            {title}
          </h1>
          <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-text-dim">
            {subtitle}
          </div>
        </div>

        <div className="flex gap-2.5 mt-1">
          <Button variant="primary" kbd="↵" onClick={() => (window.location.href = primary.href)}>
            {primary.label}
          </Button>
          {secondary && (
            <Button onClick={() => (window.location.href = secondary!.href)}>
              {secondary.label}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-px w-full mt-4 bg-border-base border border-border-base rounded overflow-hidden">
          {capabilities.map(c => (
            <CapabilityCard key={c.category} {...c} />
          ))}
        </div>
      </div>
    </section>
  );
}
