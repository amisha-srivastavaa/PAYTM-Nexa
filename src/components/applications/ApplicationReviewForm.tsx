import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertCircle, Save, Send, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { Input, Select, Textarea } from '@/components/ui/FormFields';
import { Button } from '@/components/ui/Button';
import { AlertBanner, Card, CardHeader, CardBody, InfoRow, DemoNotice } from '@/components/ui/shared';
import { ApplicationStatusBadge } from '@/components/ui/Badge';
import { computeReadinessChecks } from '@/services/validation.service';
import { saveApplication, updateMerchant, addActivity } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Merchant, Recommendation, MerchantApplication, ApplicationFormData } from '@/types';

interface ApplicationReviewFormProps {
  merchant: Merchant;
  recommendation?: Recommendation;
  existingApplication?: MerchantApplication;
  onSaved: (app: MerchantApplication) => void;
}

export function ApplicationReviewForm({
  merchant,
  recommendation,
  existingApplication,
  onSaved,
}: ApplicationReviewFormProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<ApplicationFormData>(() => existingApplication?.formData ?? {
    businessName: merchant.businessName,
    ownerName: merchant.ownerName,
    businessType: merchant.businessType,
    phone: merchant.phone,
    email: merchant.email,
    gstin: merchant.gstin,
    address: { ...merchant.address },
    deviceSetup: recommendation?.recommendedSetup.label,
    deviceProductIds: recommendation?.recommendedSetup.devices.map(d => d.id),
    notes: merchant.notes,
  });

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedApp, setSavedApp] = useState<MerchantApplication | undefined>(existingApplication);
  const [signOffChecked, setSignOffChecked] = useState(false);

  const checks = computeReadinessChecks(form);
  const allPassed = checks.every(c => c.passed);
  const failedChecks = checks.filter(c => !c.passed);

  const handleSaveDraft = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 250));
    const app = saveApplication({
      merchantId: merchant.id,
      status: 'draft',
      formData: form,
      readinessChecks: checks,
      recommendation,
    });
    updateMerchant(merchant.id, { status: 'incomplete' });
    setSavedApp(app);
    setSaving(false);
    onSaved(app);
  };

  const handleMarkReady = async () => {
    if (!allPassed || !signOffChecked) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 400));
    const app = saveApplication({
      merchantId: merchant.id,
      status: 'ready_for_review',
      formData: form,
      readinessChecks: checks,
      recommendation,
    });
    updateMerchant(merchant.id, { status: 'ready_for_submission' });
    addActivity({
      merchantId: merchant.id,
      merchantName: merchant.businessName,
      action: 'Application marked Ready for Review',
      timestamp: new Date().toISOString(),
      status: 'ready_for_submission',
    });
    setSavedApp(app);
    setSubmitting(false);
    onSaved(app);
  };

  return (
    <div className="space-y-4">
      {/* Header status card */}
      <div className="bg-white border border-[#E4EAF2] rounded-lg p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-[#172B4D] uppercase tracking-wide">
              Application Dossier & Final Pre-Review
            </h2>
            <ApplicationStatusBadge status={savedApp?.status ?? 'draft'} />
          </div>
          <p className="text-[11px] text-[#667085] mt-0.5">
            Verify merchant agreement details and confirm field acquisition readiness.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveDraft}
            loading={saving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Draft
          </Button>
        </div>
      </div>

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Form Details (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Business & KYC Summary */}
          <div className="bg-white border border-[#E4EAF2] rounded-lg p-4 shadow-xs space-y-2">
            <h3 className="text-xs font-semibold text-[#172B4D] pb-2 border-b border-[#E4EAF2]">
              Merchant & Premises Summary
            </h3>
            <div className="divide-y divide-[#E4EAF2]">
              <InfoRow label="Trading Name" value={form.businessName} />
              <InfoRow label="Proprietor Name" value={form.ownerName} />
              <InfoRow label="Business Category" value={<span className="capitalize">{form.businessType}</span>} />
              <InfoRow label="Contact Mobile" value={form.phone} />
              <InfoRow label="GSTIN" value={form.gstin || 'Not provided (unregistered micro-merchant)'} />
              <InfoRow
                label="Store Address"
                value={`${form.address.line1}, ${form.address.city}, ${form.address.state} — ${form.address.pincode}`}
              />
            </div>
          </div>

          {/* Selected Device Setup */}
          <div className="bg-white border border-[#E4EAF2] rounded-lg p-4 shadow-xs">
            <h3 className="text-xs font-semibold text-[#172B4D] pb-2 mb-2 border-b border-[#E4EAF2]">
              Selected Hardware Deployment
            </h3>
            {recommendation ? (
              <div className="p-3 bg-[#FAFCFE] border border-[#E4EAF2] rounded space-y-1">
                <p className="text-xs font-bold text-[#002970]">{recommendation.recommendedSetup.label}</p>
                <p className="text-[11px] text-[#667085]">{recommendation.recommendedSetup.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-[#E4EAF2]">
                  {recommendation.recommendedSetup.devices.map(d => (
                    <span key={d.id} className="text-[10px] font-medium bg-white border border-[#E4EAF2] px-2 py-0.5 rounded text-[#172B4D]">
                      {d.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#98A2B3] italic">No hardware package selected yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Pre-submission Readiness Checklist (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#E4EAF2] rounded-lg shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E4EAF2] bg-[#FAFCFE] flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#172B4D]">Readiness Verification Gate</h3>
              <span className={allPassed ? 'text-[#16845B] text-[10px] font-semibold' : 'text-[#D92D20] text-[10px] font-semibold'}>
                {checks.filter(c => c.passed).length}/{checks.length} Passed
              </span>
            </div>

            <div className="divide-y divide-[#E4EAF2] p-1">
              {checks.map((chk, i) => (
                <div key={i} className="p-2.5 flex items-start gap-2.5 text-xs">
                  {chk.passed ? (
                    <div className="w-4 h-4 rounded-full bg-[#ECFDF3] text-[#16845B] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-[#FEF3F2] text-[#D92D20] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <XCircle className="w-3 h-3" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-xs font-medium', chk.passed ? 'text-[#172B4D]' : 'text-[#D92D20]')}>
                      {chk.label}
                    </p>
                    {chk.message && (
                      <p className="text-[10px] text-[#667085] mt-0.5">{chk.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Field Sales Sign-off Confirmation */}
            <div className="p-3 bg-[#FAFCFE] border-t border-[#E4EAF2] space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={signOffChecked}
                  onChange={e => setSignOffChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#D0D5DD] text-[#00BAF2] focus:ring-[#00BAF2]"
                />
                <span className="text-[11px] text-[#172B4D] leading-tight">
                  I confirm that physical premises and merchant identity have been reviewed per Paytm field onboarding guidelines.
                </span>
              </label>

              <Button
                variant="primary"
                size="md"
                className="w-full"
                disabled={!allPassed || !signOffChecked}
                loading={submitting}
                onClick={handleMarkReady}
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Mark Ready for Review
              </Button>

              {!allPassed && (
                <p className="text-[10px] text-[#D92D20] text-center">
                  Resolve failed checks before marking this application ready.
                </p>
              )}
            </div>
          </div>

          <DemoNotice>
            Marking ready updates the prototype pipeline status to "Ready for Review". Live banking submission is excluded from this hackathon prototype.
          </DemoNotice>
        </div>
      </div>

      {savedApp && savedApp.status === 'ready_for_review' && (
        <div className="bg-[#ECFDF3] border border-[#A6F4C5] rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#16845B]" />
            <div>
              <p className="text-xs font-bold text-[#16845B]">Application Marked Ready for Review</p>
              <p className="text-[11px] text-[#126E4B]">Record is queued for territory operations verification.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/applications')}>
            View in Applications
          </Button>
        </div>
      )}
    </div>
  );
}
