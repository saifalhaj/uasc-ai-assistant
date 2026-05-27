'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Document } from '@/lib/types';
import { DocumentTable, type SortKey } from '@/components/library/DocumentTable';
import { LibraryToolbar } from '@/components/library/LibraryToolbar';
import { DeleteConfirmModal } from '@/components/library/DeleteConfirmModal';
import { useAuth, hasLevel } from '@/app/AuthProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LibraryPage() {
  const { user } = useAuth();
  // Only L4 users can delete documents
  const canDelete = hasLevel(user, 'L4');
  // Only L3+ users can upload
  const canUpload = hasLevel(user, 'L3');

  const [documents, setDocuments]   = useState<Document[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [classification, setClassification] = useState('all');
  const [tier, setTier]             = useState('all');
  const [sort, setSort]             = useState<SortKey>('uploadedAt');
  const [order, setOrder]           = useState<'asc' | 'desc'>('desc');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting]     = useState(false);
  const [toast, setToast]               = useState<{ msg: string; tone: 'green' | 'red' } | null>(null);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, order });
      if (search)                    params.set('q', search);
      if (classification !== 'all') params.set('classification', classification);
      if (tier !== 'all')           params.set('sourceTier', tier);

      const res = await fetch(`${API_URL}/documents?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // API returns { documents: [...], total: N } or just [...]
      if (Array.isArray(data)) {
        setDocuments(data);
        setTotal(data.length);
      } else {
        setDocuments(data.documents ?? []);
        setTotal(data.total ?? (data.documents ?? []).length);
      }
    } catch {
      setDocuments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, classification, tier, sort, order]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // ── keyboard shortcut cmd/ctrl+K → focus search ───────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('library-search')?.focus();
      }
      if (e.key === 'Escape' && deleteTarget) {
        setDeleteTarget(null);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [deleteTarget]);

  // ── sort toggle ────────────────────────────────────────────────────────────
  function handleSort(key: SortKey) {
    if (sort === key) {
      setOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(key);
      setOrder('desc');
    }
  }

  // ── delete flow ────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/documents/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      // optimistic remove
      setDocuments(prev => prev.filter(d => d.id !== deleteTarget.id));
      setTotal(t => Math.max(0, t - 1));
      showToast(`${deleteTarget.id} removed from corpus.`, 'green');
    } catch {
      showToast('Delete failed. Please try again.', 'red');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }

  function showToast(msg: string, tone: 'green' | 'red') {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 3500);
  }

  function handleCopyCite(id: string) {
    navigator.clipboard?.writeText(id).catch(() => {});
  }

  function handleView(id: string) {
    // Redirects to the document's public storage URL via the API
    window.open(`${API_URL}/documents/${id}/download`, '_blank');
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="overflow-auto h-full">
      <div className="px-8 py-7 pb-16 max-w-[1400px] mx-auto">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-end gap-4 pb-[18px] border-b border-border-base mb-[18px]">
          <div>
            <h1 className="m-0 text-[24px] font-medium text-text-hi tracking-[-0.01em]">
              Insight Library
            </h1>
            <div className="mt-1 font-mono text-[11px] text-text-dim tracking-[0.04em]">
              {loading ? '…' : `${total} documents`} · indexed · sync live
            </div>
          </div>
          {canUpload && (
            <div className="ml-auto flex gap-2">
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-text-hi bg-text-hi text-bg-base text-[13px] font-medium rounded no-underline transition-all duration-120 hover:bg-white hover:border-white"
              >
                + Upload new
              </Link>
            </div>
          )}
        </div>

        {/* ── Toolbar ────────────────────────────────────────────────────── */}
        <LibraryToolbar
          search={search}
          onSearch={setSearch}
          classification={classification}
          onClassification={setClassification}
          tier={tier}
          onTier={setTier}
          resultCount={documents.length}
        />

        {/* ── Table ──────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="border border-border-base rounded bg-surf-1 p-10 text-center font-mono text-[12px] text-text-dim tracking-[0.04em]">
            Loading documents…
          </div>
        ) : (
          <DocumentTable
            documents={documents}
            sort={sort}
            order={order}
            canDelete={canDelete}
            onSort={handleSort}
            onDelete={(id, title) => setDeleteTarget({ id, title })}
            onView={handleView}
            onCopyCite={handleCopyCite}
          />
        )}
      </div>

      {/* ── Delete modal ───────────────────────────────────────────────────── */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        docId={deleteTarget?.id ?? ''}
        docTitle={deleteTarget?.title ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded border font-mono text-[12px] z-[200] whitespace-nowrap ${
            toast.tone === 'green'
              ? 'border-uasc-green text-uasc-green bg-surf-1'
              : 'border-uasc-red text-uasc-red bg-surf-1'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
