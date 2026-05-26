import { cn } from '@/lib/cn';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  kbd?: string;
  children?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:     'bg-text-hi text-bg-base border-text-hi hover:bg-white hover:border-white',
  secondary:   'bg-transparent text-text-hi border-border-bri hover:bg-text-hi/5 hover:border-text-hi',
  tertiary:    'bg-transparent text-text-mid border-transparent hover:text-text-hi hover:bg-surf-1',
  destructive: 'bg-uasc-red text-bg-base border-uasc-red hover:bg-uasc-red/90',
};

const sizes: Record<Size, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-4 py-2 text-[13px]',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  block,
  kbd,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded',
        'border transition-colors duration-150',
        'tracking-[0.01em]',
        variants[variant],
        sizes[size],
        block && 'w-full',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        className,
      )}
    >
      {children}
      {kbd && (
        <span className="font-mono text-[10px] border border-current rounded-sm px-1 opacity-70">
          {kbd}
        </span>
      )}
    </button>
  );
}
