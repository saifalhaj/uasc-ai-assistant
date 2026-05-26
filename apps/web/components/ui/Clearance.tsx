import { cn } from '@/lib/cn';

export function Clearance({
  level,
  className,
}: {
  level: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        'border border-border-bri rounded-sm px-2 py-[3px]',
        'font-mono text-[10px] tracking-[0.06em] uppercase text-text-hi',
        className,
      )}
    >
      <span className="w-[5px] h-[5px] rounded-full bg-text-hi" aria-hidden />
      {level}
    </span>
  );
}
