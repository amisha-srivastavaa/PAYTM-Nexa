import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  MonitorSmartphone,
  Calendar,
  MapPin,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Overview' },
  { to: '/merchants', icon: <Users className="w-4 h-4" />, label: 'Merchants', group: 'Primary' },
  { to: '/new-merchant', icon: <UserPlus className="w-4 h-4" />, label: 'New Merchant', group: 'Primary' },
  { to: '/applications', icon: <FileText className="w-4 h-4" />, label: 'Applications', group: 'Primary' },
  { to: '/recommendations', icon: <MonitorSmartphone className="w-4 h-4" />, label: 'Devices', group: 'Primary' },
  { to: '/follow-ups', icon: <Calendar className="w-4 h-4" />, label: 'Follow-ups', group: 'Planning' },
  { to: '/route-planner', icon: <MapPin className="w-4 h-4" />, label: 'Route Planner', group: 'Planning' },
];

export function Sidebar() {
  const location = useLocation();
  let currentGroup = '';

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-[#E4EAF2] flex flex-col select-none" aria-label="Main navigation">
      {/* Brand Header */}
      <div className="px-4 py-3.5 border-b border-[#E4EAF2]">
        <div className="flex items-center gap-2.5">
          {/* Geometric NEXA Brand Mark */}
          <div className="relative w-7 h-7 rounded-md bg-[#002970] flex items-center justify-center flex-shrink-0 shadow-xs overflow-hidden">
            <svg viewBox="0 0 28 28" className="w-5 h-5" fill="none">
              <path d="M6 21V7l8 14h8V7h-4v14L10 7H6z" fill="#00BAF2" />
              <circle cx="21" cy="7" r="2.5" fill="#FFFFFF" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-[#002970] tracking-tight">NEXA</span>
              <span className="text-[10px] font-semibold text-[#00BAF2] bg-[#EBF9FE] px-1 py-0.2 rounded border border-[#B2E9FC]">FSE</span>
            </div>
            <p className="text-[10px] font-medium text-[#667085] leading-tight">Merchant Operations</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-2.5 px-2 space-y-0.5" aria-label="Application sections">
        {NAV_ITEMS.map((item) => {
          const showGroup = item.group && item.group !== currentGroup;
          if (showGroup) currentGroup = item.group!;

          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to);

          return (
            <div key={item.to}>
              {showGroup && (
                <p className="px-2.5 pt-3 pb-1 text-[10px] font-semibold text-[#98A2B3] uppercase tracking-wider">
                  {item.group}
                </p>
              )}
              <NavLink
                to={item.to}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-all group relative',
                  isActive
                    ? 'bg-[#EBF9FE] text-[#002970] font-semibold border-l-2 border-[#00BAF2] pl-2'
                    : 'text-[#667085] hover:bg-[#F5F8FC] hover:text-[#172B4D]',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={cn('flex-shrink-0 transition-colors', isActive ? 'text-[#00BAF2]' : 'text-[#667085] group-hover:text-[#172B4D]')}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 text-[#00BAF2] flex-shrink-0" />}
              </NavLink>
            </div>
          );
        })}
      </nav>

      {/* Bottom Environment Indicator */}
      <div className="p-3 border-t border-[#E4EAF2] bg-[#FAFCFE]">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-white border border-[#E4EAF2]">
          <span className="w-2 h-2 rounded-full bg-[#00BAF2] animate-pulse flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-[#172B4D] truncate">Prototype Environment</p>
            <p className="text-[10px] text-[#667085] truncate">Demo Mode · Seed Data</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
