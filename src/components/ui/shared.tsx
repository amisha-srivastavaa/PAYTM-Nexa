import { cn } from '@/lib/utils';

// ─── CompletenessBar ───────────────────────────────────────────────────────
export function CompletenessBar({ value, className }: { value: number; className?: string }) {
  const color = value >= 90 ? 'bg-[#16845B]' : value >= 60 ? 'bg-[#00BAF2]' : 'bg-[#B76E00]';
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 bg-[#EAECF0] rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-300', color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11px] font-medium tabular-nums text-[#667085] w-8 text-right">{value}%</span>
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
      <div className="w-10 h-10 rounded-full bg-[#EDF3FB] text-[#002970] flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-xs font-semibold text-[#172B4D] mb-1">{title}</p>
      {description && <p className="text-[11px] text-[#667085] max-w-xs mb-3.5">{description}</p>}
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
        <h1 className="text-sm font-semibold text-[#172B4D]">{title}</h1>
        {description && <p className="text-xs text-[#667085] mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white border border-[#E4EAF2] rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.04)]', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-4 py-3 border-b border-[#E4EAF2]', className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-4 py-3.5', className)}>{children}</div>;
}

// ─── Divider ───────────────────────────────────────────────────────────────
export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-[#E4EAF2]', className)} />;
}

// ─── InfoRow ───────────────────────────────────────────────────────────────
export function InfoRow({ label, value, className }: { label: string; value?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start gap-3 py-1.5 text-xs', className)}>
      <span className="text-[#667085] w-36 flex-shrink-0 font-medium">{label}</span>
      <span className="text-[#172B4D] flex-1">{value ?? <span className="text-[#98A2B3] italic">—</span>}</span>
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
    info: 'bg-[#EBF9FE] border-[#B2E9FC] text-[#006080]',
    warning: 'bg-[#FFFAEB] border-[#FEDF89] text-[#935800]',
    error: 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]',
    success: 'bg-[#ECFDF3] border-[#A6F4C5] text-[#126E4B]',
  };
  return (
    <div className={cn('border rounded-md px-3 py-2.5 flex items-start gap-2.5 text-xs', styles[variant], className)} role="alert">
      {icon && <span className="flex-shrink-0 mt-0.5">{icon}</span>}
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

// ─── DemoNotice ───────────────────────────────────────────────────────────
export function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#EDF3FB] border border-[#D0E1F9] text-[11px] text-[#002970]" role="note">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00BAF2] flex-shrink-0" />
      <span className="font-medium">Prototype · Demo Mode:</span>
      <span className="text-[#344054]">{children}</span>
    </div>
  );
}
