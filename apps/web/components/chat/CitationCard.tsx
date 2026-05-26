import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/Badge';
import type { Citation, Classification, SourceTier } from '@/lib/types';

const classificationTone: Record<Classification, 'red' | 'amber' | 'green'> = {
  restricted: 'red',
  internal:   'amber',
  public:     'green',
};

const sourceTierLabel: Record<SourceTier, string> = {
  authoritative: 'AUTH',
  reference:     'REF',
  external:      'EXT',
};

export function CitationCard({
  citation,
  onClick,
  focused,
}: {
  citation: Citation;
  onClick?: () => void;
  focused?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'block w-full text-left p-3 rounded border bg-surf-1',
        'transition-colors duration-150',
        focused ? 'border-text-hi' : 'border-border-base hover:border-border-hi',
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <span className="font-mono text-[10px] text-text-hi border border-border-hi rounded-sm px-1.5 py-[1px]">
          {citation.n}
        </span>
        <Badge tone={classificationTone[citation.classification]}>
          {citation.classification.toUpperCase()}
        </Badge>
        <Badge tone="muted">{sourceTierLabel[citation.sourceTier]}</Badge>
      </div>
      <div className="text-[13px] leading-snug text-text-hi mb-1">{citation.title}</div>
      <div className="font-mono text-[10px] text-text-dim">
        Issued {formatTimestamp(citation.issuedAt)}
      </div>
      <div
        className={cn(
          'mt-2 pt-2 border-t border-dashed border-border-base',
          'text-[12px] leading-relaxed text-text-mid',
          citation.excerptIsArabic && 'font-ar text-right',
        )}
        style={citation.excerptIsArabic ? { direction: 'rtl' } : undefined}
      >
        &ldquo;{citation.excerpt}&rdquo;
      </div>
    </button>
  );
}

function formatTimestamp(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.valueOf())) return iso;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())} · ${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  } catch {
    return iso;
  }
}
