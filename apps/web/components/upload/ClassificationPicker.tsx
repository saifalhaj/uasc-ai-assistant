'use client';

import { cn } from '@/lib/cn';
import type { Classification } from '@/lib/types';

interface Option {
  value: Classification;
  label: string;
  desc: string;
  tone: 'red' | 'amber' | 'green';
}

const OPTIONS: Option[] = [
  {
    value: 'restricted',
    label: 'RESTRICTED',
    desc: 'Operational records, threat intel, identifying details. L4+ only.',
    tone: 'red',
  },
  {
    value: 'internal',
    label: 'INTERNAL',
    desc: 'SOPs, training, internal advisories. All UASC personnel.',
    tone: 'amber',
  },
  {
    value: 'public',
    label: 'PUBLIC',
    desc: 'Published NOTAMs, public regulations, open data.',
    tone: 'green',
  },
];

const toneText:   Record<Option['tone'], string> = { red: 'text-uasc-red', amber: 'text-uasc-amber', green: 'text-uasc-green' };
const toneBorder: Record<Option['tone'], string> = { red: 'border-uasc-red', amber: 'border-uasc-amber', green: 'border-uasc-green' };
const tonePip:    Record<Option['tone'], string> = { red: 'bg-uasc-red', amber: 'bg-uasc-amber', green: 'bg-uasc-green' };

export function ClassificationPicker({
  value,
  onChange,
  canSelectRestricted = true,
}: {
  value: Classification | null;
  onChange: (v: Classification) => void;
  /** When false, the RESTRICTED option is hidden (L4-only in policy). */
  canSelectRestricted?: boolean;
}) {
  const visible = canSelectRestricted ? OPTIONS : OPTIONS.filter(o => o.value !== 'restricted');
  const cols = visible.length === 3 ? 'grid-cols-3' : 'grid-cols-2';
  return (
    <div className={`grid ${cols} gap-1.5`} role="radiogroup" aria-label="Classification">
      {visible.map(opt => {
        const selected = value === opt.value;
        return (
          <button
            type="button"
            key={opt.value}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              'text-left bg-bg-deep rounded p-3.5',
              'border transition-colors duration-150',
              'hover:bg-surf-1 hover:border-border-hi',
              selected ? `${toneBorder[opt.tone]} bg-surf-1` : 'border-border-base',
            )}
          >
            <div className={cn('flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] font-medium', toneText[opt.tone])}>
              <span className={cn('w-2 h-2 rounded-full border-[1.5px] border-current', selected && tonePip[opt.tone])} aria-hidden />
              {opt.label}
            </div>
            <div className="mt-1.5 text-[11px] text-text-dim leading-snug">{opt.desc}</div>
          </button>
        );
      })}
    </div>
  );
}
