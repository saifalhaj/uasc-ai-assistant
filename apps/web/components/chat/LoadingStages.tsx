import { cn } from '@/lib/cn';

export type LoadingStageState = 'pending' | 'active' | 'done';

export interface LoadingStage {
  label: string;
  detail?: string;
  state: LoadingStageState;
}

export function LoadingStages({ stages }: { stages: LoadingStage[] }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="font-mono text-[10px] tracking-[0.1em] text-text-hi uppercase">
        Assistant
      </div>
      <div className="flex flex-col gap-1.5 mt-1">
        {stages.map((s, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-2 font-mono text-[11px] tracking-[0.04em]',
              s.state === 'active' ? 'text-text-hi'
                : s.state === 'done' ? 'text-text-mid'
                : 'text-text-dim',
            )}
          >
            <span
              className={cn(
                'w-[5px] h-[5px] rounded-full bg-current',
                s.state === 'active' && 'uasc-dot-pulse',
              )}
              aria-hidden
            />
            <span>{s.label}</span>
            {s.detail && <span className="text-text-faint">· {s.detail}</span>}
            <span className="ml-2 opacity-70">
              {s.state === 'done' ? 'done' : s.state === 'active' ? 'running' : 'pending'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
