import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import Link from 'next/link';

export interface ConversationItem {
  id: string;
  title: string;
  when?: string;
  active?: boolean;
  href: string;
}

export function Sidebar({
  recent,
  saved,
  onNew,
  libraryHref = '/upload',
}: {
  recent: ConversationItem[];
  saved?: ConversationItem[];
  onNew?: () => void;
  libraryHref?: string;
}) {
  return (
    <aside className="border-r border-border-base bg-bg-deep flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border-base">
        <Button variant="primary" block onClick={onNew}>+ New query</Button>
      </div>

      {recent.length > 0 && <Section label="Recent" items={recent} />}
      {saved && saved.length > 0 && <Section label="Saved" items={saved} />}

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

function Section({ label, items }: { label: string; items: ConversationItem[] }) {
  return (
    <div className="p-4 border-b border-border-base">
      <Label className="mb-2.5 block">{label}</Label>
      {items.map(c => (
        <Link
          key={c.id}
          href={c.href}
          className={cn(
            'block px-2.5 py-2 -mx-2.5 rounded-sm border border-transparent',
            'text-[13px] text-text-mid transition-colors duration-150',
            'hover:bg-surf-1',
            c.active && 'bg-surf-1 border-border-base text-text-hi',
          )}
        >
          <span className="block truncate">{c.title}</span>
          {c.when && (
            <span className="block font-mono text-[10px] text-text-faint mt-0.5">{c.when}</span>
          )}
        </Link>
      ))}
    </div>
  );
}
