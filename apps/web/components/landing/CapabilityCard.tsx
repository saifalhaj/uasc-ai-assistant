import Link from 'next/link';
import { cn } from '@/lib/cn';
import { Label } from '@/components/ui/Label';

export type CapabilityCategory = 'OPS' | 'RISK' | 'SOP' | 'TECH';

export interface CapabilityCardProps {
  category: CapabilityCategory;
  title: string;
  description: string;
  href: string;
}

const categoryTone: Record<CapabilityCategory, React.ComponentProps<typeof Label>['tone']> = {
  OPS:  'green',
  RISK: 'red',
  TECH: 'amber',
  SOP:  'hi',
};

export function CapabilityCard({ category, title, description, href }: CapabilityCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group block bg-bg-deep p-5 min-h-[168px]',
        'flex flex-col gap-3.5',
        'transition-colors duration-150 hover:bg-surf-1',
      )}
    >
      <div className="flex items-center justify-between">
        <Label tone={categoryTone[category]}>{category}</Label>
        <span
          className={cn(
            'font-mono text-sm text-text-faint',
            'transition-all duration-150',
            'group-hover:text-text-hi group-hover:translate-x-0.5',
          )}
        >
          →
        </span>
      </div>
      <div className="text-base font-medium text-text-hi leading-snug">{title}</div>
      <div className="mt-auto text-xs text-text-dim">{description}</div>
    </Link>
  );
}
