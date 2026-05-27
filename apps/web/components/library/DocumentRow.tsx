'use client';

import type { Document } from '@/lib/types';
import { ReferenceCount } from './ReferenceCount';

interface DocumentRowProps {
  doc: Document;
  onDelete: (id: string, title: string) => void;
  onView: (id: string) => void;
  onCopyCite: (id: string) => void;
}

const CLASSIFICATION_META: Record<string, { label: string; colorClass: string }> = {
  restricted: { label: 'RESTRICTED', colorClass: 'text-uasc-red border-uasc-red' },
  internal:   { label: 'INTERNAL',   colorClass: 'text-uasc-amber border-uasc-amber' },
  public:     { label: 'PUBLIC',     colorClass: 'text-uasc-green border-uasc-green' },
};

const STATUS_META: Record<string, { label: string; dotClass: string; textClass: string }> = {
  indexed:    { label: 'INDEXED',    dotClass: 'bg-uasc-green',                textClass: 'text-text-mid' },
  processing: { label: 'PROCESSING', dotClass: 'bg-uasc-amber uasc-dot-pulse', textClass: 'text-uasc-amber' },
  failed:     { label: 'FAILED',     dotClass: 'bg-uasc-red',                  textClass: 'text-uasc-red' },
};

const TIER_LABEL: Record<string, string> = {
  authoritative: 'AUTH',
  reference:     'REF',
  external:      'EXT',
};

const LANG_LABEL: Record<string, string> = {
  en:       'EN',
  ar:       'AR',
  bilingual: 'BIL',
};

function formatUploadedAt(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString('en-GB', { month: 'short' });
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} · ${hh}:${mm}`;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentRow({ doc, onDelete, onView, onCopyCite }: DocumentRowProps) {
  const cls = CLASSIFICATION_META[doc.classification] ?? CLASSIFICATION_META.internal;
  const status = STATUS_META[doc.status] ?? STATUS_META.indexed;
  const tier = TIER_LABEL[doc.sourceTier] ?? doc.sourceTier.slice(0, 3).toUpperCase();
  const lang = LANG_LABEL[doc.language] ?? doc.language.toUpperCase();

  const iconBtnBase =
    'w-7 h-7 inline-flex items-center justify-center bg-transparent border border-transparent text-text-dim cursor-pointer rounded-[3px] transition-all duration-120 font-mono text-[13px]';

  return (
    <tr
      className="border-b border-border-base transition-colors duration-120 last:border-none hover:bg-surf-2 group"
      data-id={doc.id}
    >
      {/* Document */}
      <td className="px-3.5 py-3 align-top text-[13px]">
        <div className="flex items-start gap-2.5 min-w-[240px]">
          <div className="shrink-0 w-7 h-8 border border-border-hi rounded-[2px] flex items-center justify-center font-mono text-[8px] text-text-mid bg-bg-deep tracking-[0.04em]">
            {doc.extension}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span
              className="text-text-hi font-medium text-[13.5px] leading-snug overflow-hidden text-ellipsis whitespace-nowrap max-w-[280px]"
              title={doc.title}
            >
              {doc.title}
            </span>
            <span className="font-mono text-[10px] text-text-dim tracking-[0.04em]">
              {doc.id} · {doc.pages ? `${doc.pages}pp · ` : ''}{formatSize(doc.sizeBytes)}
            </span>
            {doc.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap mt-0.5">
                {doc.tags.map(tag => (
                  <span
                    key={tag}
                    className="font-mono text-[9px] text-text-dim border border-border-base px-1 py-px rounded-[2px] tracking-[0.04em]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Classification */}
      <td className="px-3.5 py-3 align-top">
        <span
          className={`inline-flex items-center gap-1.5 font-mono text-[10px] px-1.5 py-px border rounded-[2px] uppercase tracking-[0.06em] ${cls.colorClass}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
          {cls.label}
        </span>
      </td>

      {/* Source tier */}
      <td className="px-3.5 py-3 align-top">
        <span className="font-mono text-[11px] text-text-mid tracking-[0.04em]">{tier}</span>
      </td>

      {/* Language */}
      <td className="px-3.5 py-3 align-top">
        <span className="font-mono text-[11px] text-text-mid tracking-[0.04em]">{lang}</span>
      </td>

      {/* Uploaded by */}
      <td className="px-3.5 py-3 align-top">
        <div className="flex flex-col gap-0.5">
          <span className="text-text-hi text-[12.5px]">{doc.uploader.name}</span>
          <span className="font-mono text-[10px] text-text-dim tracking-[0.04em]">{doc.uploader.clearance}</span>
        </div>
      </td>

      {/* Uploaded at */}
      <td className="px-3.5 py-3 align-top">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[12px] text-text-hi tracking-[0.04em]">{formatUploadedAt(doc.uploadedAt)}</span>
          <span className="font-mono text-[10px] text-text-dim tracking-[0.04em]">{relativeTime(doc.uploadedAt)}</span>
        </div>
      </td>

      {/* References */}
      <td className="px-3.5 py-3 align-top">
        <ReferenceCount
          count={doc.referenceCount}
          history={doc.referenceHistory}
          lastReferencedAt={doc.lastReferencedAt}
        />
      </td>

      {/* Status */}
      <td className="px-3.5 py-3 align-top">
        <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.04em] ${status.textClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dotClass}`} />
          {status.label}
        </span>
      </td>

      {/* Actions */}
      <td className="px-3.5 py-3 align-top">
        <div className="flex gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity duration-120">
          <button
            onClick={() => onView(doc.id)}
            title="View document"
            className={`${iconBtnBase} hover:bg-surf-3 hover:text-text-hi hover:border-border-hi`}
          >
            ↗
          </button>
          <button
            onClick={() => onCopyCite(doc.id)}
            title="Copy citation ID"
            className={`${iconBtnBase} hover:bg-surf-3 hover:text-text-hi hover:border-border-hi`}
          >
            ⎘
          </button>
          <button
            onClick={() => onDelete(doc.id, doc.title)}
            title="Remove from corpus"
            className={`${iconBtnBase} hover:bg-[rgba(217,117,112,0.08)] hover:text-uasc-red hover:border-uasc-red`}
          >
            ×
          </button>
        </div>
      </td>
    </tr>
  );
}
