import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { MerchantList } from '@/pages/MerchantList';
import { MerchantDetail } from '@/pages/MerchantDetail';
import { MerchantProfiler } from '@/pages/MerchantProfiler';
import { ApplicationList, ApplicationDetail } from '@/pages/Applications';
import { RecommendationsPage } from '@/pages/Recommendations';
import { FollowUps } from '@/pages/FollowUps';
import { RoutePlanner } from '@/pages/RoutePlanner';

function NotFound() {
  return (
    <div className="flex items-center justify-center h-full py-20 flex-col gap-3">
      <p className="text-sm font-medium text-neutral-700">Page not found</p>
      <a href="/" className="text-sm text-blue-600 hover:underline">Return to Overview</a>
    </div>
  );
}

export function Router() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/merchants" element={<MerchantList />} />
        <Route path="/merchants/:id" element={<MerchantDetail />} />
        <Route path="/merchants/:id/edit" element={<MerchantProfiler />} />
        <Route path="/new-merchant" element={<MerchantProfiler isNew />} />
        <Route path="/applications" element={<ApplicationList />} />
        <Route path="/applications/:id" element={<ApplicationDetail />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/follow-ups" element={<FollowUps />} />
        <Route path="/route-planner" element={<RoutePlanner />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}
