import { cn } from '@/lib/cn';

type DotTone = 'green' | 'amber' | 'red' | 'neutral';

const toneClass: Record<DotTone, string> = {
  green:   'bg-uasc-green',
  amber:   'bg-uasc-amber',
  red:     'bg-uasc-red',
  neutral: 'bg-text-mid',
};

export function Dot({
  tone = 'green',
  live,
  className,
}: {
  tone?: DotTone;
  live?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-block w-[7px] h-[7px] rounded-full',
        toneClass[tone],
        live && 'uasc-dot-pulse',
        className,
      )}
      aria-hidden
    />
  );
}
