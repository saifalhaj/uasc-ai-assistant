'use client';

interface LibraryToolbarProps {
  search: string;
  onSearch: (v: string) => void;
  classification: string;
  onClassification: (v: string) => void;
  tier: string;
  onTier: (v: string) => void;
  resultCount: number;
}

function filterBtn(active: boolean, extra?: string) {
  return [
    'font-mono text-[11px] px-2.5 py-1 border border-border-base bg-bg-deep',
    'rounded-[3px] cursor-pointer transition-all duration-120 uppercase tracking-[0.06em]',
    'hover:border-border-hi hover:text-text-hi',
    active ? 'bg-surf-1' : 'text-text-mid',
    extra ?? '',
  ].join(' ');
}

export function LibraryToolbar({
  search,
  onSearch,
  classification,
  onClassification,
  tier,
  onTier,
  resultCount,
}: LibraryToolbarProps) {
  return (
    <div className="flex items-center gap-2.5 mb-3.5 flex-wrap">
      {/* Search box */}
      <div className="flex items-center gap-2 bg-bg-deep border border-border-base px-3 py-[7px] rounded flex-1 max-w-[360px] transition-[border-color,box-shadow] duration-120 focus-within:border-text-hi focus-within:shadow-[0_0_0_3px_rgba(240,243,246,0.06)]">
        <span className="text-text-dim font-mono text-[12px]">⌕</span>
        <input
          id="library-search"
          className="flex-1 bg-transparent border-none outline-none text-text-hi text-[13px] placeholder-text-faint"
          placeholder="Search by title, tag, classification, or upload id…"
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
        <span className="font-mono text-[10px] text-text-faint border border-border-base px-[5px] py-px rounded-[2px]">
          ⌘K
        </span>
      </div>

      {/* Classification filter */}
      <div className="flex items-center gap-1">
        <span className="font-mono text-[10px] text-text-dim tracking-[0.08em] uppercase mr-1">
          Classification
        </span>
        <button
          onClick={() => onClassification('all')}
          className={filterBtn(
            classification === 'all',
            classification === 'all' ? 'border-text-hi text-text-hi' : '',
          )}
        >
          All
        </button>
        <button
          onClick={() => onClassification('restricted')}
          className={filterBtn(
            classification === 'restricted',
            classification === 'restricted' ? 'border-uasc-red text-uasc-red' : '',
          )}
        >
          Restricted
        </button>
        <button
          onClick={() => onClassification('internal')}
          className={filterBtn(
            classification === 'internal',
            classification === 'internal' ? 'border-uasc-amber text-uasc-amber' : '',
          )}
        >
          Internal
        </button>
        <button
          onClick={() => onClassification('public')}
          className={filterBtn(
            classification === 'public',
            classification === 'public' ? 'border-uasc-green text-uasc-green' : '',
          )}
        >
          Public
        </button>
      </div>

      {/* Tier filter */}
      <div className="flex items-center gap-1">
        <span className="font-mono text-[10px] text-text-dim tracking-[0.08em] uppercase mr-1">
          Tier
        </span>
        {(['all', 'authoritative', 'reference', 'external'] as const).map(v => {
          const label = { all: 'All', authoritative: 'Auth', reference: 'Ref', external: 'Ext' }[v];
          return (
            <button
              key={v}
              onClick={() => onTier(v)}
              className={filterBtn(
                tier === v,
                tier === v ? 'border-text-hi text-text-hi' : '',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Result count */}
      <div className="ml-auto font-mono text-[11px] text-text-dim tracking-[0.04em]">
        <span className="text-text-hi">{resultCount}</span> shown
      </div>
    </div>
  );
}
