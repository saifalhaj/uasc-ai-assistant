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
  libraryHref = '/upload',
}: {
  recent: ConversationItem[];
  saved?: ConversationItem[];
  onNew?: () => void;
  /** Called with the conversation id when a recent/saved row is clicked. */
  onOpen?: (id: string) => void;
  libraryHref?: string;
}) {
  return (
    <aside className="border-r border-border-base bg-bg-deep flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border-base">
        <Button variant="primary" block onClick={onNew}>+ New query</Button>
      </div>

      <div className="overflow-y-auto flex-1 min-h-0">
        {recent.length > 0 && <Section label="Recent" items={recent} onOpen={onOpen} />}
        {saved && saved.length > 0 && <Section label="Saved" items={saved} onOpen={onOpen} />}
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
}: {
  label: string;
  items: ConversationItem[];
  onOpen?: (id: string) => void;
}) {
  return (
    <div className="p-4 border-b border-border-base">
      <Label className="mb-2.5 block">{label}</Label>
      {items.map(c => (
        <button
          key={c.id}
          type="button"
          onClick={() => onOpen?.(c.id)}
          className={cn(
            'block w-full text-left px-2.5 py-2 -mx-2.5 rounded-sm border border-transparent',
            'text-[13px] text-text-mid transition-colors duration-150',
            'hover:bg-surf-1 cursor-pointer',
            c.active && 'bg-surf-1 border-border-base text-text-hi',
          )}
        >
          <span className="block truncate">{c.title}</span>
          {c.when && (
            <span className="block font-mono text-[10px] text-text-faint mt-0.5">{c.when}</span>
          )}
        </button>
      ))}
    </div>
  );
}
