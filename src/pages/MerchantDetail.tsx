import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, ChevronRight, FileText, MonitorSmartphone, ShieldCheck, MapPin, Building2, Phone } from 'lucide-react';
import { getMerchantById, getDocumentsByMerchant, getApplicationByMerchant, getRecommendationByMerchant } from '@/lib/store';
import { MerchantStatusBadge, ApplicationStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CompletenessBar, Card, CardHeader, CardBody, InfoRow, DemoNotice } from '@/components/ui/shared';
import { formatDateTime, formatCurrency } from '@/lib/utils';

export function MerchantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const merchant = id ? getMerchantById(id) : undefined;
  const docs = id ? getDocumentsByMerchant(id) : [];
  const app = id ? getApplicationByMerchant(id) : undefined;
  const rec = id ? getRecommendationByMerchant(id) : undefined;

  if (!merchant) {
    return (
      <div className="p-8 text-center py-20 space-y-3">
        <p className="text-xs text-[#667085]">Merchant record not found.</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/merchants')}>
          Back to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-[#667085] mb-1">
          <Link to="/merchants" className="hover:text-[#002970] transition-colors">Merchants</Link>
          <ChevronRight className="w-3 h-3 text-[#98A2B3]" />
          <span className="text-[#172B4D] font-medium">{merchant.businessName}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[#002970] tracking-tight">{merchant.businessName}</h1>
                <MerchantStatusBadge status={merchant.status} />
              </div>
              <p className="text-xs text-[#667085] capitalize mt-0.5">
                {merchant.businessType} Store · {merchant.address.city}, {merchant.address.state}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/merchants')}
              leftIcon={<ArrowLeft className="w-3 h-3" />}
            >
              Directory
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={() => navigate(`/merchants/${merchant.id}/edit`)}
            >
              Resume Profiling
            </Button>
          </div>
        </div>
      </div>

      {/* Completeness Card */}
      <div className="bg-white border border-[#E4EAF2] rounded-lg p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <span className="text-xs font-semibold text-[#172B4D] flex-shrink-0">Profile Completeness:</span>
          <CompletenessBar value={merchant.completeness} className="flex-1" />
        </div>
        <DemoNotice>
          Prototype dossier view · Field territory record
        </DemoNotice>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Business Information Card */}
        <div className="bg-white border border-[#E4EAF2] rounded-lg shadow-xs overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#E4EAF2] bg-[#FAFCFE] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#002970]" />
            <h2 className="text-xs font-semibold text-[#172B4D]">Business & Owner Identity</h2>
          </div>
          <div className="p-4 divide-y divide-[#E4EAF2]">
            <InfoRow label="Trading Name" value={merchant.businessName} />
            <InfoRow label="Proprietor Name" value={merchant.ownerName} />
            <InfoRow label="Category" value={<span className="capitalize">{merchant.businessType}</span>} />
            <InfoRow label="Mobile Phone" value={merchant.phone} />
            <InfoRow label="Email Address" value={merchant.email} />
            <InfoRow label="GSTIN" value={merchant.gstin || 'Unregistered'} />
          </div>
        </div>

        {/* Physical Premises Card */}
        <div className="bg-white border border-[#E4EAF2] rounded-lg shadow-xs overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#E4EAF2] bg-[#FAFCFE] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#002970]" />
            <h2 className="text-xs font-semibold text-[#172B4D]">Store Location</h2>
          </div>
          <div className="p-4 divide-y divide-[#E4EAF2]">
            <InfoRow label="Street Line 1" value={merchant.address.line1} />
            <InfoRow label="Locality" value={merchant.address.line2} />
            <InfoRow label="City / State" value={`${merchant.address.city}, ${merchant.address.state}`} />
            <InfoRow label="PIN Code" value={merchant.address.pincode} />
            <InfoRow label="Audio Alert Need" value={merchant.needsAudibleConfirmation ? 'Soundbox Required' : 'Not Requested'} />
            <InfoRow label="Field Notes" value={merchant.notes} />
          </div>
        </div>

        {/* Application Status Card */}
        <div className="bg-white border border-[#E4EAF2] rounded-lg shadow-xs overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#E4EAF2] bg-[#FAFCFE] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#002970]" />
              <h2 className="text-xs font-semibold text-[#172B4D]">Application Dossier</h2>
            </div>
            {app && <ApplicationStatusBadge status={app.status} />}
          </div>
          <div className="p-4">
            {app ? (
              <div className="space-y-3">
                <div className="divide-y divide-[#E4EAF2]">
                  <InfoRow label="Application ID" value={<span className="font-mono text-xs">{app.id}</span>} />
                  <InfoRow label="Last Updated" value={formatDateTime(app.updatedAt)} />
                  <InfoRow
                    label="Readiness Checks"
                    value={`${app.readinessChecks.filter(c => c.passed).length} of ${app.readinessChecks.length} passed`}
                  />
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => navigate(`/applications/${app.id}`)}
                >
                  View Application Dossier →
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 text-[#667085]">
                <p className="text-xs">No formal application created yet.</p>
                <Button
                  variant="secondary"
                  size="xs"
                  className="mt-2"
                  onClick={() => navigate(`/merchants/${merchant.id}/edit`)}
                >
                  Start Application
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Hardware Recommendation Card */}
        <div className="bg-white border border-[#E4EAF2] rounded-lg shadow-xs overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#E4EAF2] bg-[#FAFCFE] flex items-center gap-2">
            <MonitorSmartphone className="w-4 h-4 text-[#002970]" />
            <h2 className="text-xs font-semibold text-[#172B4D]">Configured Hardware</h2>
          </div>
          <div className="p-4">
            {rec ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#002970]">{rec.recommendedSetup.label}</p>
                <p className="text-[11px] text-[#667085]">{rec.recommendedSetup.description}</p>
                <div className="pt-2 border-t border-[#E4EAF2] flex flex-wrap gap-1">
                  {rec.recommendedSetup.devices.map(d => (
                    <span key={d.id} className="text-[10px] bg-[#F2F4F7] text-[#344054] px-1.5 py-0.5 rounded">
                      {d.name} ({formatCurrency(d.price)})
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-[#667085]">
                <p className="text-xs">Payment hardware not yet configured.</p>
                <Button
                  variant="secondary"
                  size="xs"
                  className="mt-2"
                  onClick={() => navigate(`/merchants/${merchant.id}/edit`)}
                >
                  Run Recommendation Engine
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
