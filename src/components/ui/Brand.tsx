import { Link } from 'react-router-dom';

interface BrandProps {
  compact?: boolean;
  linked?: boolean;
}

export function Brand({ compact = false, linked = false }: BrandProps) {
  const content = (
    <span className="flex items-center gap-2.5">
      <svg className="h-9 w-9 shrink-0" viewBox="0 0 40 40" role="img" aria-label="NEXA mark">
        <rect x="1" y="1" width="38" height="38" rx="12" fill="var(--brand-navy)" />
        <path d="M11 27V13l12 14h6V13h-4v14L13 13h-2" fill="none" stroke="var(--brand-cyan)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" />
        <circle cx="29" cy="11" r="2" fill="var(--brand-cyan)" />
      </svg>
      <span className="min-w-0">
        <span className="block font-display text-base font-bold tracking-[0.16em] text-[var(--brand-navy)]">NEXA</span>
        {!compact && (
          <span className="block text-[10px] leading-tight text-[var(--text-muted)]">
            Merchant onboarding, minutes not days
          </span>
        )}
      </span>
    </span>
  );

  return linked ? <Link to="/" aria-label="NEXA home">{content}</Link> : content;
}
