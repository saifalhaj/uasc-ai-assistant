import { cn } from '@/lib/cn';

export interface ErrorStateProps {
  code: string;
  title: string;
  message: string;
  actions: { label: string; onClick?: () => void; href?: string }[];
}

export function ErrorState({ code, title, message, actions }: ErrorStateProps) {
  return (
    <div
      className={cn('border border-uasc-red rounded p-3.5', 'bg-uasc-red/[0.08]')}
      role="alert"
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-uasc-red border border-uasc-red rounded-sm px-1.5 py-[1px]">
          {title}
        </span>
        <span className="font-mono text-[10px] text-text-dim">{code}</span>
      </div>
      <div className="text-text-hi text-sm">{message}</div>
      <div className="mt-2 font-mono text-[11px] text-text-mid space-y-0.5">
        {actions.map((a, i) =>
          a.href ? (
            <a key={i} href={a.href} className="block hover:text-text-hi">
              → {a.label}
            </a>
          ) : (
            <button
              key={i}
              type="button"
              onClick={a.onClick}
              className="block text-left w-full hover:text-text-hi"
            >
              → {a.label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
