'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { UploadForm, type UploadPayload } from '@/components/upload/UploadForm';
import type { Document } from '@/lib/types';
import type { UploadResponse as ApiUploadResponse } from '@uasc/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Map UI SourceTier → API source_tier
function toApiSourceTier(tier: string): string {
  if (tier === 'reference') return 'vetted';
  if (tier === 'external') return 'open';
  return tier; // 'authoritative' is the same
}

// Map UI Language → API language
function toApiLanguage(lang: string): string {
  if (lang === 'bilingual') return 'mixed';
  return lang; // 'en' and 'ar' are the same
}

const CLASS_PIP: Record<string, string> = {
  restricted: 'bg-uasc-red',
  internal:   'bg-uasc-amber',
  public:     'bg-uasc-green',
};

// ── Library link + recent uploads strip ──────────────────────────────────────
function LibraryStrip() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/documents?limit=4&sort=uploadedAt&order=desc`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const list: Document[] = Array.isArray(data) ? data : (data.documents ?? []);
        setDocs(list);
        setTotal(Array.isArray(data) ? list.length : (data.total ?? list.length));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
      {docs.map(doc => (
        <Link
          key={doc.id}
          href={`/library?q=${encodeURIComponent(doc.id)}`}
          className="flex-shrink-0 flex items-center gap-1.5 bg-bg-deep border border-border-base rounded-[3px] px-2.5 py-1 font-mono text-[11px] text-text-mid no-underline hover:border-border-hi hover:text-text-hi transition-all duration-120"
        >
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${CLASS_PIP[doc.classification] ?? 'bg-text-dim'}`} />
          <span className="truncate max-w-[180px]" title={doc.title}>{doc.title}</span>
        </Link>
      ))}
      {docs.length > 0 && (
        <Link
          href="/library"
          className="flex-shrink-0 font-mono text-[11px] text-text-dim no-underline hover:text-text-hi transition-colors duration-120 ml-auto whitespace-nowrap"
        >
          See all{total !== null ? ` (${total})` : ''} →
        </Link>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function InsightManagementPage() {
  const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<ApiUploadResponse | null>(null);
  const [error, setError]   = useState<{ code: string; message: string } | null>(null);

  async function handleSubmit(payload: UploadPayload) {
    setError(null);
    const form = new FormData();
    form.append('file', payload.file);
    form.append('title', payload.file.name);
    form.append('classification', payload.classification);
    form.append('source_tier', toApiSourceTier(payload.sourceTier));
    form.append('language', toApiLanguage(payload.language));
    form.append('tags', payload.tags.join(','));

    const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: form });
    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      throw new Error(detail.detail || `HTTP ${res.status}`);
    }
    setResult(await res.json());
    setStatus('done');
  }

  function handleError(err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload failed';
    setError({ code: 'ERR-4001', message: msg });
    setStatus('error');
  }

  function reset() {
    setStatus('idle');
    setResult(null);
    setError(null);
  }

  if (status === 'done' && result) {
    return (
      <div className="grid place-items-center min-h-full px-5">
        <div className="w-full max-w-[560px] flex flex-col gap-5">
          <div>
            <h2 className="text-[22px] font-medium text-text-hi m-0">Insight imported</h2>
            <div className="mt-1 font-mono text-[11px] text-text-dim tracking-[0.04em]">
              Document is queued for indexing
            </div>
          </div>

          <div className="border border-border-base bg-surf-1 rounded divide-y divide-border-base">
            <Row label="Document ID">
              <span className="font-mono text-[12px] text-text-hi">{result.document_id}</span>
            </Row>
            <Row label="Status">
              <Badge tone={result.status === 'indexed' ? 'green' : result.status === 'error' ? 'red' : 'amber'}>
                {result.status}
              </Badge>
            </Row>
            {result.chunk_count !== undefined && (
              <Row label="Chunks">
                <span className="font-mono text-[12px] text-text-hi">{result.chunk_count}</span>
              </Row>
            )}
          </div>

          <div className="flex gap-2.5">
            <Button variant="primary" onClick={reset}>Import another</Button>
            <Button variant="secondary" onClick={() => { window.location.href = '/chat'; }}>
              Open assistant
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="relative min-h-full overflow-auto px-5 pt-8 pb-16">
      <div className="relative w-full max-w-[560px] mx-auto flex flex-col gap-3.5">

        {/* ── Header with library link pill ─────────────────────────────── */}
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-medium text-text-hi m-0">
              Upload into Ops Intelligence Platform
            </h2>
            <div className="mt-1 font-mono text-[11px] text-text-dim tracking-[0.04em]">
              SOP · threat report · NOTAM · operational record
            </div>
          </div>
          <Link
            href="/library"
            className="flex-shrink-0 flex items-center gap-1.5 border border-border-base bg-bg-deep rounded-[3px] px-2.5 py-1.5 font-mono text-[11px] text-text-dim no-underline hover:border-border-hi hover:text-text-hi transition-all duration-120 mt-1 whitespace-nowrap"
          >
            ↗ library
          </Link>
        </header>

        {/* ── Recent uploads strip ─────────────────────────────────────── */}
        <LibraryStrip />

        {/* ── Form (no header — moved above) ───────────────────────────── */}
        <UploadForm
          onSubmit={async (payload) => {
            try {
              await handleSubmit(payload);
            } catch (err) {
              handleError(err);
              throw err;
            }
          }}
          onCancel={() => { window.location.href = '/'; }}
          hideHeader
        />
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <Label className="w-32 shrink-0">{label}</Label>
      {children}
    </div>
  );
}
