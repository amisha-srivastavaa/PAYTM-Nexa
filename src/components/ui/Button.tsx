import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'cyan' | 'navy' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-1.5 font-semibold rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00BAF2] focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none text-xs';

  const variants = {
    // Paytm Signature Light Blue Button (white text, crisp shadow)
    primary: 'bg-[#00BAF2] text-white hover:bg-[#00a4d6] active:bg-[#008fba] shadow-[0_1px_3px_rgba(0,186,242,0.3)] hover:shadow-[0_2px_6px_rgba(0,186,242,0.4)]',
    cyan: 'bg-[#00BAF2] text-[#002970] font-bold hover:bg-[#00a4d6] hover:text-white shadow-[0_1px_3px_rgba(0,186,242,0.25)]',
    navy: 'bg-[#002970] text-white hover:bg-[#001f56] active:bg-[#00153a] shadow-xs',
    secondary: 'bg-white border border-[#D8ECF8] text-[#002970] hover:bg-[#F0F8FD] hover:border-[#BAE7F8] shadow-xs',
    ghost: 'text-[#5E6C84] hover:bg-[#EBF7FD] hover:text-[#002970]',
    danger: 'bg-[#D92D20] text-white hover:bg-[#b42318] active:bg-[#912018] shadow-xs',
    outline: 'border border-[#D8ECF8] text-[#002970] bg-white hover:bg-[#F0F8FD] hover:border-[#BAE7F8]',
  };

  const sizes = {
    xs: 'h-6 px-2 text-[11px] gap-1',
    sm: 'h-7 px-3 text-xs',
    md: 'h-8 px-4 text-xs',
    lg: 'h-9 px-5 text-sm',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
