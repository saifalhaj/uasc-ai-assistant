'use client';

import { cn } from '@/lib/cn';
import { useState, type KeyboardEvent } from 'react';

export function Composer({
  scope = 'public + internal insight library',
  model = 'UASC-RAG-v3',
  stage = 'ready',
  onSubmit,
  placeholder = 'Ask in English or Arabic…',
  disabled = false,
}: {
  scope?: string;
  model?: string;
  stage?: string;
  placeholder?: string;
  disabled?: boolean;
  onSubmit: (text: string) => void;
}) {
  const [value, setValue] = useState('');

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const text = value.trim();
    if (!text || disabled) return;
    onSubmit(text);
    setValue('');
  }

  return (
    <div className="border-t border-border-base bg-bg-deep px-8 pt-4 pb-5">
      <div className="max-w-[760px] mx-auto">
        <div
          className={cn(
            'flex items-center gap-2.5 px-3.5 py-2.5',
            'bg-surf-1 border border-border-base rounded',
            'focus-within:border-text-hi focus-within:ring-2 focus-within:ring-text-hi/10',
          )}
        >
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={onKey}
            placeholder={placeholder}
            disabled={disabled}
            dir="auto"
            className="flex-1 bg-transparent outline-none border-none text-text-hi placeholder:text-text-faint disabled:opacity-50"
          />
          <button
            type="button"
            onClick={submit}
            disabled={disabled || !value.trim()}
            className={cn(
              'bg-text-hi text-bg-base px-2.5 py-1 rounded-sm',
              'font-mono text-[11px] font-medium',
              'hover:bg-white',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            )}
          >
            SEND ⏎
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2.5 font-mono text-[10px] tracking-[0.04em] text-text-dim">
          <span>Scope</span>
          <span className="text-text-mid border border-border-base rounded-sm px-2 py-[2px]">
            {scope}
          </span>
          <span className="ml-auto">model · {model} · stage · {stage}</span>
        </div>
      </div>
    </div>
  );
}
