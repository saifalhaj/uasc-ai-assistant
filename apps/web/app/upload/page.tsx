"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { UploadForm, type UploadPayload } from '@/components/upload/UploadForm';
import type { UploadResponse } from '@uasc/shared';

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

export default function InsightManagementPage() {
  const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

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
            <Button variant="secondary" onClick={() => (window.location.href = '/chat')}>
              Open assistant
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <UploadForm
      onSubmit={async (payload) => {
        try {
          await handleSubmit(payload);
        } catch (err) {
          handleError(err);
          throw err; // let UploadForm reset its submitting state
        }
      }}
      onCancel={() => (window.location.href = '/')}
    />
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
