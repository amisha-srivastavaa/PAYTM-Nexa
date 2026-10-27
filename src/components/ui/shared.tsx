import { cn } from '@/lib/utils';

// ─── CompletenessBar ───────────────────────────────────────────────────────
export function CompletenessBar({ value, className }: { value: number; className?: string }) {
  const color = value >= 90 ? 'bg-[#16845B]' : value >= 60 ? 'bg-[#00BAF2]' : 'bg-[#B76E00]';
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-2 bg-[#E1F3FD] rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-300', color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11px] font-bold tabular-nums text-[#002970] w-8 text-right">{value}%</span>
    </div>
  );
}

// ─── Spinner ───────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' };
  return (
    <svg className={cn('animate-spin text-[#00BAF2]', sizes[size], className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4A10 10 0 002 12h2z" />
    </svg>
  );
}

// ─── EmptyState ────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-10 h-10 rounded-full bg-[#E5F5FD] text-[#00BAF2] border border-[#BAE7F8] flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-xs font-bold text-[#002970] mb-1">{title}</p>
      {description && <p className="text-[11px] text-[#5E6C84] max-w-xs mb-3.5">{description}</p>}
      {action}
    </div>
  );
}

// ─── SectionHeader ─────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function SectionHeader({ title, description, actions }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h1 className="text-sm font-bold text-[#002970]">{title}</h1>
        {description && <p className="text-xs text-[#5E6C84] mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white border border-[#D8ECF8] rounded-lg shadow-[0_1px_3px_rgba(0,186,242,0.06)]', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-4 py-3 border-b border-[#D8ECF8] bg-[#F7FCFE]', className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-4 py-3.5', className)}>{children}</div>;
}

// ─── Divider ───────────────────────────────────────────────────────────────
export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-[#D8ECF8]', className)} />;
}

// ─── InfoRow ───────────────────────────────────────────────────────────────
export function InfoRow({ label, value, className }: { label: string; value?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start gap-3 py-1.5 text-xs', className)}>
      <span className="text-[#5E6C84] w-36 flex-shrink-0 font-medium">{label}</span>
      <span className="text-[#172B4D] font-medium flex-1">{value ?? <span className="text-[#8993A4] italic">—</span>}</span>
    </div>
  );
}

// ─── AlertBanner ───────────────────────────────────────────────────────────
interface AlertBannerProps {
  variant: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function AlertBanner({ variant, title, children, icon, className }: AlertBannerProps) {
  const styles = {
    info: 'bg-[#EAF6FD] border-[#BAE7F8] text-[#006080]',
    warning: 'bg-[#FFFAEB] border-[#FEDF89] text-[#935800]',
    error: 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]',
    success: 'bg-[#ECFDF5] border-[#A6F4C5] text-[#126E4B]',
  };
  return (
    <div className={cn('border rounded-md px-3.5 py-2.5 flex items-start gap-2.5 text-xs', styles[variant], className)} role="alert">
      {icon && <span className="flex-shrink-0 mt-0.5">{icon}</span>}
      <div className="flex-1">
        {title && <p className="font-bold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

// ─── DemoNotice ───────────────────────────────────────────────────────────
export function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#EBF7FD] border border-[#BAE7F8] text-[11px] text-[#005B7A] shadow-xs" role="note">
      <span className="w-2 h-2 rounded-full bg-[#00BAF2] animate-pulse flex-shrink-0" />
      <span className="font-bold text-[#002970]">NEXA demo:</span>
      <span className="text-[#005B7A]">{children}</span>
    </div>
  );
}
