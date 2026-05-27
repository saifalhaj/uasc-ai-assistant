import { DocumentSparkline } from './DocumentSparkline';

interface ReferenceCountProps {
  count: number;
  history: number[];
  lastReferencedAt: string | null;
}

function relativeTime(iso: string | null): string {
  if (!iso) return 'never';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export function ReferenceCount({ count, history, lastReferencedAt }: ReferenceCountProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`font-mono text-[18px] font-medium min-w-[28px] tracking-[-0.02em] ${
          count === 0 ? 'text-text-faint' : 'text-text-hi'
        }`}
      >
        {count}
      </span>
      <div>
        <DocumentSparkline values={history} />
        <div className="font-mono text-[10px] text-text-dim mt-0.5 tracking-[0.04em]">
          last · {relativeTime(lastReferencedAt)}
        </div>
      </div>
    </div>
  );
}
