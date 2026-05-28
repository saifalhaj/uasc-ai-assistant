'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import Link from 'next/link';

export interface ConversationItem {
  id: string;
  title: string;
  when?: string;
  active?: boolean;
}

export function Sidebar({
  recent,
  saved,
  onNew,
  onOpen,
  onRename,
  onDelete,
  libraryHref = '/upload',
}: {
  recent: ConversationItem[];
  saved?: ConversationItem[];
  onNew?: () => void;
  /** Called with the conversation id when a recent/saved row is clicked. */
  onOpen?: (id: string) => void;
  /** Commit a new title for a thread. Resolves true on success. */
  onRename?: (id: string, newTitle: string) => Promise<boolean> | boolean;
  /** Request deletion. Sidebar fires this after the parent confirms. */
  onDelete?: (id: string) => void;
  libraryHref?: string;
}) {
  return (
    <aside className="border-r border-border-base bg-bg-deep flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border-base">
        <Button variant="primary" block onClick={onNew}>+ New query</Button>
      </div>

      <div className="overflow-y-auto flex-1 min-h-0">
        {recent.length > 0 && (
          <Section label="Recent" items={recent} onOpen={onOpen} onRename={onRename} onDelete={onDelete} />
        )}
        {saved && saved.length > 0 && (
          <Section label="Saved" items={saved} onOpen={onOpen} onRename={onRename} onDelete={onDelete} />
        )}
      </div>

      <div className="mt-auto p-4 border-t border-border-base">
        <Link
          href={libraryHref}
          className={cn(
            'flex items-center justify-between',
            'px-2.5 py-2 -mx-2.5 rounded-sm',
            'text-[13px] text-text-mid hover:text-text-hi hover:bg-surf-1',
          )}
        >
          <span>Document Library</span>
          <span className="font-mono text-text-faint">↗</span>
        </Link>
      </div>
    </aside>
  );
}

function Section({
  label,
  items,
  onOpen,
  onRename,
  onDelete,
}: {
  label: string;
  items: ConversationItem[];
  onOpen?: (id: string) => void;
  onRename?: (id: string, newTitle: string) => Promise<boolean> | boolean;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="p-4 border-b border-border-base">
      <Label className="mb-2.5 block">{label}</Label>
      {items.map(c => (
        <Row
          key={c.id}
          item={c}
          onOpen={onOpen}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function Row({
  item,
  onOpen,
  onRename,
  onDelete,
}: {
  item: ConversationItem;
  onOpen?: (id: string) => void;
  onRename?: (id: string, newTitle: string) => Promise<boolean> | boolean;
  onDelete?: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.title);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep draft in sync if title changes externally while not editing
  useEffect(() => {
    if (!editing) setDraft(item.title);
  }, [item.title, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  async function commit() {
    const next = draft.trim();
    if (!next || next === item.title || !onRename) {
      setEditing(false);
      setDraft(item.title);
      return;
    }
    setSubmitting(true);
    try {
      const ok = await onRename(item.id, next);
      if (!ok) setDraft(item.title);
    } finally {
      setSubmitting(false);
      setEditing(false);
    }
  }

  function cancel() {
    setDraft(item.title);
    setEditing(false);
  }

  return (
    <div
      className={cn(
        'group relative flex items-center gap-1 px-2.5 py-2 -mx-2.5 rounded-sm',
        'border border-transparent transition-colors duration-150',
        'hover:bg-surf-1',
        item.active && 'bg-surf-1 border-border-base',
      )}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          disabled={submitting}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              cancel();
            }
          }}
          className={cn(
            'flex-1 min-w-0 bg-bg-deep border border-border-hi rounded-[3px]',
            'px-2 py-1 text-[13px] text-text-hi outline-none',
            'focus:border-text-hi focus:ring-2 focus:ring-text-hi/10',
          )}
        />
      ) : (
        <button
          type="button"
          onClick={() => onOpen?.(item.id)}
          className={cn(
            'flex-1 min-w-0 text-left cursor-pointer bg-transparent border-none p-0',
            'text-[13px] transition-colors duration-150',
            item.active ? 'text-text-hi' : 'text-text-mid',
          )}
        >
          <span className="block truncate">{item.title}</span>
          {item.when && (
            <span className="block font-mono text-[10px] text-text-faint mt-0.5">{item.when}</span>
          )}
        </button>
      )}

      {!editing && (onRename || onDelete) && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-120">
          {onRename && (
            <IconButton
              label="Rename"
              onClick={() => setEditing(true)}
            >
              ✎
            </IconButton>
          )}
          {onDelete && (
            <IconButton
              label="Delete"
              tone="red"
              onClick={() => onDelete(item.id)}
            >
              ✕
            </IconButton>
          )}
        </div>
      )}
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: 'red';
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={e => { e.stopPropagation(); onClick(); }}
      className={cn(
        'inline-flex items-center justify-center w-6 h-6 rounded-sm',
        'font-mono text-[11px] leading-none',
        'border border-transparent bg-transparent',
        'text-text-dim hover:text-text-hi hover:border-border-hi hover:bg-bg-deep',
        tone === 'red' && 'hover:text-uasc-red hover:border-uasc-red',
        'cursor-pointer transition-colors duration-120',
      )}
    >
      {children}
    </button>
  );
}
