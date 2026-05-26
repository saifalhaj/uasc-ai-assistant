import { cn } from '@/lib/cn';

function Seg({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-text-faint">{label}</span>
      {children}
    </span>
  );
}

export function Statusbar({
  version,
  lastSync,
  model,
  screen,
  tty = 'ops-room-1',
  net = 'nominal',
}: {
  version: string;
  lastSync: string;
  model: string;
  screen: string;
  tty?: string;
  net?: string;
}) {
  return (
    <footer
      className={cn(
        'flex items-center gap-[18px] px-5',
        'border-t border-border-base bg-bg-deep',
        'font-mono text-[10px] text-text-dim tracking-[0.04em]',
      )}
    >
      <Seg label="v">{version}</Seg>
      <Seg label="sync">{lastSync}</Seg>
      <Seg label="model">{model}</Seg>
      <span className="ml-auto flex gap-[18px]">
        <Seg label="screen">{screen}</Seg>
        <Seg label="tty">{tty}</Seg>
        <Seg label="net">{net}</Seg>
      </span>
    </footer>
  );
}
