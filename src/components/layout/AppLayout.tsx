import { useLocation } from 'react-router-dom';
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

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F8FC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title={title} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
          tabIndex={-1}
          aria-label={title}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
