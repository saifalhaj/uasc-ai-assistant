import { cn } from '@/lib/cn';
import { Label } from '@/components/ui/Label';

type Tone = 'neutral' | 'green' | 'amber' | 'red';

const valColor: Record<Tone, string> = {
  neutral: 'text-text-hi',
  green:   'text-uasc-green',
  amber:   'text-uasc-amber',
  red:     'text-uasc-red',
};
const barColor: Record<Tone, string> = {
  neutral: 'bg-text-hi',
  green:   'bg-uasc-green',
  amber:   'bg-uasc-amber',
  red:     'bg-uasc-red',
};

export function InstrumentTile({
  label,
  value,
  tone = 'neutral',
  fill,
}: {
  label: string;
  value: React.ReactNode;
  tone?: Tone;
  fill?: number | null;
}) {
  return (
    <div className="bg-surf-1 px-3 py-2.5">
      <Label>{label}</Label>
      <div className={cn('mt-1 font-mono text-lg font-medium tracking-[-0.02em]', valColor[tone])}>
        {value}
      </div>
      {fill !== null && fill !== undefined && (
        <div className="mt-1.5 h-[3px] bg-border-base rounded-sm overflow-hidden">
          <div
            className={cn('h-full', barColor[tone])}
            style={{ width: `${Math.max(0, Math.min(1, fill)) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
