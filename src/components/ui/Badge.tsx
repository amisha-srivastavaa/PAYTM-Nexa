import { cn } from '@/lib/utils';
import type { MerchantStatus, ApplicationStatus, VisitStatus, FieldStatus, ExtractionStatus } from '@/types';

interface BadgeProps {
  label: string;
  variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'navy';
  className?: string;
  dot?: boolean;
}

export function Badge({ label, variant, className, dot = false }: BadgeProps) {
  const base = 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold leading-4 border';
  const variants = {
    default: 'bg-[#F0F8FD] text-[#002970] border-[#D8ECF8]',
    success: 'bg-[#ECFDF5] text-[#16845B] border-[#A6F4C5]',
    warning: 'bg-[#FFFAEB] text-[#B76E00] border-[#FEDF89]',
    error: 'bg-[#FEF3F2] text-[#D92D20] border-[#FECDCA]',
    info: 'bg-[#E5F6FD] text-[#007FA5] border-[#BAE7F8]',
    neutral: 'bg-[#F4F9FD] text-[#5E6C84] border-[#D8ECF8]',
    navy: 'bg-[#EDF3FB] text-[#002970] border-[#CDE0F5]',
  };
  const dotColors = {
    default: 'bg-[#00BAF2]',
    success: 'bg-[#16845B]',
    warning: 'bg-[#B76E00]',
    error: 'bg-[#D92D20]',
    info: 'bg-[#00BAF2]',
    neutral: 'bg-[#8993A4]',
    navy: 'bg-[#002970]',
  };

  return (
    <span className={cn(base, variants[variant], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant])} />}
      {label}
    </span>
  );
}

export function MerchantStatusBadge({ status }: { status: MerchantStatus }) {
  const map: Record<MerchantStatus, { label: string; variant: BadgeProps['variant'] }> = {
    new: { label: 'New', variant: 'info' },
    extracting: { label: 'Extracting', variant: 'navy' },
    needs_review: { label: 'Needs Review', variant: 'warning' },
    incomplete: { label: 'Incomplete', variant: 'warning' },
    ready_for_submission: { label: 'Ready', variant: 'success' },
    submitted: { label: 'Submitted (Simulated)', variant: 'neutral' },
    extraction_failed: { label: 'Extraction Failed', variant: 'error' },
  };
  const { label, variant } = map[status];
  return <Badge label={label} variant={variant} dot />;
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const map: Record<ApplicationStatus, { label: string; variant: BadgeProps['variant'] }> = {
    draft: { label: 'Draft', variant: 'neutral' },
    ready_for_review: { label: 'Ready for Review', variant: 'success' },
    submitted_simulated: { label: 'Submitted (Simulated)', variant: 'info' },
    rejected: { label: 'Rejected', variant: 'error' },
  };
  const { label, variant } = map[status];
  return <Badge label={label} variant={variant} dot />;
}

export function VisitStatusBadge({ status }: { status: VisitStatus }) {
  const map: Record<VisitStatus, { label: string; variant: BadgeProps['variant'] }> = {
    scheduled: { label: 'Scheduled', variant: 'info' },
    completed: { label: 'Completed', variant: 'success' },
    missed: { label: 'Missed', variant: 'error' },
    cancelled: { label: 'Cancelled', variant: 'neutral' },
  };
  const { label, variant } = map[status];
  return <Badge label={label} variant={variant} dot />;
}

export function FieldStatusBadge({ status }: { status: FieldStatus }) {
  const map: Record<FieldStatus, { label: string; variant: BadgeProps['variant'] }> = {
    extracted: { label: 'AI Extracted', variant: 'info' },
    needs_review: { label: 'Needs Review', variant: 'warning' },
    user_confirmed: { label: 'User Verified', variant: 'success' },
    missing: { label: 'Missing', variant: 'neutral' },
    invalid: { label: 'Invalid Format', variant: 'error' },
  };
  const { label, variant } = map[status];
  return <Badge label={label} variant={variant} />;
}

export function ExtractionStatusBadge({ status }: { status: ExtractionStatus }) {
  const map: Record<ExtractionStatus, { label: string; variant: BadgeProps['variant'] }> = {
    not_started: { label: 'Not Started', variant: 'neutral' },
    pending: { label: 'Pending', variant: 'neutral' },
    processing: { label: 'Extracting...', variant: 'navy' },
    completed: { label: 'Extracted', variant: 'success' },
    failed: { label: 'Failed', variant: 'error' },
  };
  const { label, variant } = map[status];
  return <Badge label={label} variant={variant} dot />;
}
