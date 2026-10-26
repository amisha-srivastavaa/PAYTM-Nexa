import { NavLink, useLocation } from 'react-router-dom';
import { BriefcaseBusiness, Camera, ClipboardCheck } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const TITLES: Record<string, string> = {
  '/': 'Merchant Overview',
  '/merchants': 'Merchant Directory',
  '/new-merchant': 'Create Merchant Profile',
  '/applications': 'Applications',
  '/recommendations': 'Device Recommendations',
  '/follow-ups': 'Follow-ups',
  '/route-planner': 'Route Planner',
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const basePath = '/' + location.pathname.split('/')[1];
  const title = TITLES[basePath] ?? 'NEXA Operations';
  const mobileTabs = [
    { to: '/merchants', label: 'Merchants', icon: <BriefcaseBusiness className="h-5 w-5" /> },
    { to: '/new-merchant', label: 'Capture', icon: <Camera className="h-5 w-5" /> },
    { to: '/applications', label: 'Tasks', icon: <ClipboardCheck className="h-5 w-5" /> },
  ];

  return (
    <div className="flex min-h-screen h-screen overflow-hidden bg-[var(--page)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title={title} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto pb-20 md:pb-0"
          tabIndex={-1}
          aria-label={title}
        >
          {children}
        </main>
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-[var(--border)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(9,37,75,0.08)] md:hidden" aria-label="Mobile navigation">
          {mobileTabs.map(tab => {
            const active = tab.to === '/new-merchant'
              ? location.pathname === tab.to || location.pathname.endsWith('/edit')
              : location.pathname === tab.to || location.pathname.startsWith(`${tab.to}/`);
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${active ? 'text-[#007FA5]' : 'text-[#71859A]'}`}
                aria-label={tab.label}
                aria-current={active ? 'page' : undefined}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
