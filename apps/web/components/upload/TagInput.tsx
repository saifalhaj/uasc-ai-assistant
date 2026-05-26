'use client';

import { cn } from '@/lib/cn';
import { useState, type KeyboardEvent } from 'react';

export function TagInput({
  value,
  onChange,
  placeholder = 'add tag…',
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  function commit() {
    const next = draft.trim();
    if (!next) return;
    if (value.includes(next)) { setDraft(''); return; }
    onChange([...value, next]);
    setDraft('');
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  function remove(tag: string) {
    onChange(value.filter(t => t !== tag));
  }

  return (
    <div
      className={cn(
        'flex flex-wrap gap-1.5 min-h-[38px]',
        'border border-border-base bg-bg-deep rounded',
        'px-2 py-1.5',
        'focus-within:border-text-hi focus-within:ring-2 focus-within:ring-text-hi/10',
      )}
    >
      {value.map(tag => (
        <span
          key={tag}
          className={cn(
            'inline-flex items-center gap-1.5',
            'bg-surf-2 border border-border-base rounded-sm pl-2 pr-1 py-[2px]',
            'font-mono text-[11px] text-text-mid',
          )}
        >
          {tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            aria-label={`Remove ${tag}`}
            className="px-1 text-text-dim hover:text-text-hi"
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={commit}
        placeholder={placeholder}
        className={cn(
          'flex-1 min-w-[100px] px-1 py-0.5',
          'bg-transparent outline-none border-none',
          'font-mono text-[12px] text-text-hi placeholder:text-text-faint',
        )}
      />
    </div>
  );
}
