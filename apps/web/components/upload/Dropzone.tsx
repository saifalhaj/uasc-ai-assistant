'use client';

import { cn } from '@/lib/cn';
import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';

export interface DropzoneProps {
  maxBytes?: number;
  accept?: string;
  onFile: (file: File) => void;
}

export function Dropzone({
  maxBytes = 40 * 1024 * 1024,
  accept = '.pdf,.docx,.doc,.txt',
  onFile,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);
  const [picked, setPicked] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handle(file: File | null | undefined) {
    if (!file) return;
    if (file.size > maxBytes) {
      setError(`File exceeds ${(maxBytes / 1024 / 1024).toFixed(0)} MB limit.`);
      return;
    }
    setError(null);
    setPicked(file);
    onFile(file);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setHover(false);
    handle(e.dataTransfer.files?.[0]);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    handle(e.target.files?.[0]);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      onDragEnter={e => { e.preventDefault(); setHover(true); }}
      onDragOver={e => { e.preventDefault(); setHover(true); }}
      onDragLeave={() => setHover(false)}
      onDrop={onDrop}
      className={cn(
        'rounded border border-dashed border-border-hi',
        'bg-bg-deep px-6 py-11 text-center cursor-pointer',
        'transition-colors duration-150',
        'hover:border-text-hi hover:bg-surf-1',
        hover && 'border-text-hi bg-surf-1',
      )}
    >
      <input ref={inputRef} type="file" accept={accept} hidden onChange={onChange} />
      <div
        className={cn(
          'mx-auto mb-2.5 w-7 h-7 rounded-full border flex items-center justify-center text-sm',
          'text-text-mid border-text-mid',
          hover && 'text-text-hi border-text-hi',
        )}
        aria-hidden
      >
        ↑
      </div>
      <div className="text-sm font-medium text-text-hi">
        {picked ? picked.name : 'Drop a file to add it to the UASC Insight Database'}
      </div>
      <div className="text-[13px] text-text-dim mt-0.5">
        {picked
          ? `${(picked.size / 1024).toFixed(1)} KB · ready to classify`
          : 'or click anywhere in this area to browse'}
      </div>
      <div className="mt-3.5 font-mono text-[10px] tracking-[0.06em] text-text-faint">
        PDF · DOCX · TXT &nbsp;·&nbsp; ≤ {(maxBytes / 1024 / 1024).toFixed(0)} MB &nbsp;·&nbsp; EN / AR
      </div>
      {error && (
        <div className="mt-3 font-mono text-[11px] text-uasc-red">{error}</div>
      )}
    </div>
  );
}
