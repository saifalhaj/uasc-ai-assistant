'use client';

import type { Document } from '@/lib/types';
import { DocumentRow } from './DocumentRow';

export type SortKey =
  | 'title'
  | 'classification'
  | 'sourceTier'
  | 'language'
  | 'uploader'
  | 'uploadedAt'
  | 'referenceCount'
  | 'status';

interface DocumentTableProps {
  documents: Document[];
  sort: SortKey;
  order: 'asc' | 'desc';
  canDelete: boolean;
  onSort: (key: SortKey) => void;
  onDelete: (id: string, title: string) => void;
  onView: (id: string) => void;
  onCopyCite: (id: string) => void;
}

const COLUMNS: Array<{ key: SortKey | null; label: string }> = [
  { key: 'title',          label: 'Document' },
  { key: 'classification', label: 'Classification' },
  { key: 'sourceTier',     label: 'Source tier' },
  { key: 'language',       label: 'Lang' },
  { key: 'uploader',       label: 'Uploaded by' },
  { key: 'uploadedAt',     label: 'Uploaded' },
  { key: 'referenceCount', label: 'References' },
  { key: 'status',         label: 'Status' },
  { key: null,             label: '' },
];

export function DocumentTable({
  documents,
  sort,
  order,
  canDelete,
  onSort,
  onDelete,
  onView,
  onCopyCite,
}: DocumentTableProps) {
  return (
    <div className="border border-border-base rounded bg-surf-1 overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {COLUMNS.map(col => (
              <th
                key={col.label}
                onClick={col.key ? () => onSort(col.key!) : undefined}
                className={[
                  'text-left font-mono text-[10px] font-medium uppercase tracking-[0.1em]',
                  'px-3.5 py-2.5 border-b border-border-base bg-bg-deep whitespace-nowrap',
                  col.key ? 'cursor-pointer hover:text-text-hi' : '',
                  sort === col.key ? 'text-text-hi' : 'text-text-dim',
                ].join(' ')}
              >
                {col.label}
                {col.key && (
                  <span
                    className={`ml-1 text-[9px] ${sort === col.key ? 'text-text-hi' : 'text-text-faint'}`}
                  >
                    {sort === col.key ? (order === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {documents.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="text-center py-10 text-text-dim font-mono text-[12px] tracking-[0.04em]"
              >
                No documents match the current filters.
              </td>
            </tr>
          ) : (
            documents.map(doc => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                canDelete={canDelete}
                onDelete={onDelete}
                onView={onView}
                onCopyCite={onCopyCite}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
