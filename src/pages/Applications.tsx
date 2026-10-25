import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, ChevronRight } from 'lucide-react';
import { getApplications, getMerchants, getRecommendationByMerchant } from '@/lib/store';
import { ApplicationStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ApplicationReviewForm } from '@/components/applications/ApplicationReviewForm';
import { EmptyState, DemoNotice } from '@/components/ui/shared';
import { timeAgo } from '@/lib/utils';
import type { MerchantApplication } from '@/types';
import { useState } from 'react';

export function ApplicationList() {
  const navigate = useNavigate();
  const apps = getApplications();
  const merchants = getMerchants();

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-[#002970] tracking-tight">Applications & Submissions</h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Track pre-submission readiness, compliance sign-offs, and field acquisition files.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/new-merchant')}
        >
          New Merchant
        </Button>
      </div>

      <DemoNotice>
        Submissions reflect prototype review states. Field verification workflows operate in demo mode.
      </DemoNotice>

      {apps.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6 text-[#98A2B3]" />}
          title="No onboarding applications initiated"
          description="Create a merchant profile and complete the 5-step wizard to generate an application."
          action={<Button variant="primary" size="sm" onClick={() => navigate('/new-merchant')}>New Merchant</Button>}
        />
      ) : (
        <div className="bg-white border border-[#E4EAF2] rounded-lg shadow-xs overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#E4EAF2] bg-[#FAFCFE]">
            <p className="text-xs font-semibold text-[#172B4D]">{apps.length} Applications Tracked</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs" aria-label="Applications table">
              <thead>
                <tr className="border-b border-[#E4EAF2] bg-[#F8F9FC] text-[#667085]">
                  <th className="text-left px-4 py-2.5 font-medium">Merchant</th>
                  <th className="text-left px-4 py-2.5 font-medium">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium hidden md:table-cell">Hardware Setup</th>
                  <th className="text-left px-4 py-2.5 font-medium hidden lg:table-cell">Last Updated</th>
                  <th className="text-right px-4 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4EAF2]">
                {apps.map(app => {
                  const m = merchants.find(x => x.id === app.merchantId);
                  return (
                    <tr key={app.id} className="hover:bg-[#F8F9FC] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#172B4D]">{m?.businessName ?? '—'}</p>
                        <p className="text-[10px] text-[#667085] capitalize">{m?.businessType} · {m?.address.city}</p>
                      </td>
                      <td className="px-4 py-3">
                        <ApplicationStatusBadge status={app.status} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-[#344054]">
                        {app.formData.deviceSetup ?? '—'}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-[#667085] text-[11px]">
                        {timeAgo(app.updatedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => navigate(`/applications/${app.id}`)}
                        >
                          Review Dossier
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const apps = getApplications();
  const merchants = getMerchants();

  const app = apps.find(a => a.id === id);
  const merchant = app ? merchants.find(m => m.id === app.merchantId) : undefined;
  const recommendation = merchant ? getRecommendationByMerchant(merchant.id) : undefined;

  const [currentApp, setCurrentApp] = useState<MerchantApplication | undefined>(app);

  if (!app || !merchant) {
    return (
      <div className="p-8 text-center py-20 space-y-3">
        <p className="text-xs text-[#667085]">Application file not found.</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/applications')}>
          Back to Applications
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="xs"
          onClick={() => navigate('/applications')}
          leftIcon={<ArrowLeft className="w-3 h-3" />}
        >
          Applications
        </Button>
        <span className="text-xs text-[#98A2B3]">/</span>
        <span className="text-xs font-semibold text-[#172B4D]">{merchant.businessName}</span>
      </div>

      <ApplicationReviewForm
        merchant={merchant}
        recommendation={recommendation}
        existingApplication={currentApp}
        onSaved={setCurrentApp}
      />
    </div>
  );
}
