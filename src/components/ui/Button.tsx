import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'cyan' | 'secondary' | 'ghost' | 'danger' | 'outline';
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
  const base = 'inline-flex items-center justify-center gap-1.5 font-medium rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00BAF2] focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none text-xs';

  const variants = {
    primary: 'bg-[#002970] text-white hover:bg-[#001f56] active:bg-[#00153a] shadow-sm',
    cyan: 'bg-[#00BAF2] text-[#002970] font-semibold hover:bg-[#00a5d7] active:bg-[#0092bf] shadow-sm',
    secondary: 'bg-white border border-[#E4EAF2] text-[#172B4D] hover:bg-[#F5F8FC] hover:border-[#D0D5DD] shadow-sm',
    ghost: 'text-[#667085] hover:bg-[#F5F8FC] hover:text-[#172B4D]',
    danger: 'bg-[#D92D20] text-white hover:bg-[#b42318] active:bg-[#912018] shadow-sm',
    outline: 'border border-[#E4EAF2] text-[#172B4D] bg-white hover:bg-[#F5F8FC] hover:border-[#CBD5E1]',
  };

  const sizes = {
    xs: 'h-6 px-2 text-[11px] gap-1',
    sm: 'h-7 px-2.5 text-xs',
    md: 'h-8 px-3.5 text-xs',
    lg: 'h-9 px-4 text-sm',
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
