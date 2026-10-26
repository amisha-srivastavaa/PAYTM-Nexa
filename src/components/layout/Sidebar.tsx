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
  Bot,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Brand } from '@/components/ui/Brand';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Overview' },
  { to: '/agent-demo', icon: <Bot className="w-4 h-4 text-[#00BAF2]" />, label: 'AI Teammate (Live)', group: 'Autonomous Teammate' },
  { to: '/merchants', icon: <Users className="w-4 h-4" />, label: 'Merchants', group: 'Field Operations' },
  { to: '/new-merchant', icon: <UserPlus className="w-4 h-4" />, label: 'New Merchant', group: 'Field Operations' },
  { to: '/applications', icon: <FileText className="w-4 h-4" />, label: 'Applications', group: 'Field Operations' },
  { to: '/recommendations', icon: <MonitorSmartphone className="w-4 h-4" />, label: 'Devices', group: 'Field Operations' },
  { to: '/follow-ups', icon: <Calendar className="w-4 h-4" />, label: 'Follow-ups', group: 'Planning' },
  { to: '/route-planner', icon: <MapPin className="w-4 h-4" />, label: 'Route Planner', group: 'Planning' },
];

export function Sidebar() {
  const location = useLocation();
  let currentGroup = '';

  return (
    <aside className="hidden md:flex w-60 flex-shrink-0 bg-white border-r border-[#D8ECF8] flex-col select-none" aria-label="Main navigation">
      {/* Brand Header */}
      <div className="px-4 py-3.5 border-b border-[#D8ECF8] bg-[#F7FCFE]">
        <Brand linked />
        <p className="pl-11 pt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#71859A]">Field sales workspace</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5" aria-label="Application sections">
        {NAV_ITEMS.map((item) => {
          const showGroup = item.group && item.group !== currentGroup;
          if (showGroup) currentGroup = item.group!;

          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to);

          return (
            <div key={item.to}>
              {showGroup && (
                <p className="px-2.5 pt-3 pb-1 text-[10px] font-bold text-[#8993A4] uppercase tracking-wider">
                  {item.group}
                </p>
              )}
              <NavLink
                to={item.to}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-all group relative',
                  isActive
                    ? 'bg-[#E1F4FD] text-[#002970] font-bold border-l-3 border-[#00BAF2] pl-2 shadow-2xs'
                    : 'text-[#5E6C84] hover:bg-[#F0F8FD] hover:text-[#007FA5]',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={cn('flex-shrink-0 transition-colors', isActive ? 'text-[#00BAF2]' : 'text-[#8993A4] group-hover:text-[#00BAF2]')}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#00BAF2] flex-shrink-0 stroke-[2.5]" />}
              </NavLink>
            </div>
          );
        })}
      </nav>

      {/* Bottom Environment Indicator */}
      <div className="p-3 border-t border-[#D8ECF8] bg-[#F7FCFE]">
        <div className="flex items-center gap-2 px-2.5 py-2 rounded bg-white border border-[#D8ECF8] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#00BAF2] animate-pulse flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-[#002970] truncate">NEXA demo workspace</p>
            <p className="text-[10px] text-[#5E6C84] truncate">Local field workflow</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
