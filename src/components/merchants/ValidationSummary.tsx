import { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, ArrowRight, ShieldAlert, ShieldCheck } from 'lucide-react';
import { validateMerchant } from '@/services/validation.service';
import { Button } from '@/components/ui/Button';
import { AlertBanner, CompletenessBar } from '@/components/ui/shared';
import { cn } from '@/lib/utils';
import type { Merchant, ValidationIssue } from '@/types';

interface ValidationSummaryProps {
  merchant: Merchant;
  onValid: () => void;
}

export function ValidationSummary({ merchant, onValid }: ValidationSummaryProps) {
  const [issues, setIssues] = useState<ValidationIssue[]>(() => validateMerchant(merchant));
  const [running, setRunning] = useState(false);

  const handleRevalidate = async () => {
    setRunning(true);
    await new Promise(r => setTimeout(r, 350));
    setIssues(validateMerchant(merchant));
    setRunning(false);
  };

  const blocking = issues.filter(i => i.issueCode === 'required' || i.issueCode === 'invalid_format');
  const warnings = issues.filter(i => i.issueCode === 'awaiting_confirmation' || i.issueCode === 'conflicting_value');
  const canProceed = blocking.length === 0;

  const completeness = merchant.completeness;

  return (
    <div className="space-y-4">
      {/* Completeness & Readiness Banner */}
      <div className="bg-white border border-[#E4EAF2] rounded-lg p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div>
            <h2 className="text-xs font-semibold text-[#172B4D] uppercase tracking-wide">
              Onboarding Validation & Pre-Submission Audit
            </h2>
            <p className="text-[11px] text-[#667085]">
              Automated checks ensure compliance with Paytm merchant acquisition rules.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'px-2 py-0.5 rounded text-[11px] font-semibold border',
              canProceed ? 'bg-[#ECFDF3] text-[#16845B] border-[#A6F4C5]' : 'bg-[#FEF3F2] text-[#D92D20] border-[#FECDCA]',
            )}>
              {canProceed ? 'Validation Passed' : `${blocking.length} Blocking Issue${blocking.length !== 1 ? 's' : ''}`}
            </span>
            <Button
              variant="outline"
              size="xs"
              onClick={handleRevalidate}
              loading={running}
              leftIcon={<RefreshCw className="w-3 h-3" />}
            >
              Re-run Audit
            </Button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#E4EAF2]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-[#172B4D]">Merchant Profile Completeness</span>
            <span className="font-bold text-[#002970] tabular-nums">{completeness}%</span>
          </div>
          <CompletenessBar value={completeness} />
        </div>
      </div>

      {/* Issues Breakdown List */}
      <div className="bg-white border border-[#E4EAF2] rounded-lg shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E4EAF2] bg-[#FAFCFE] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-[#172B4D]">Validation Checklist Items</h3>
          <span className="text-[10px] text-[#667085]">
            {issues.length === 0 ? 'All 12 checks passed' : `${issues.length} item(s) flagged`}
          </span>
        </div>

        {issues.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#ECFDF3] text-[#16845B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-[#172B4D]">All KYC & Identity Checks Passed</p>
            <p className="text-[11px] text-[#667085] max-w-sm mx-auto">
              Mandatory business information, owner identity, contact phone, and shop location meet the pre-submission threshold.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E4EAF2]">
            {/* Blocking issues first */}
            {blocking.map((item, idx) => (
              <div key={`block-${idx}`} className="p-3.5 flex items-start gap-3 bg-[#FEF3F2]/40">
                <XCircle className="w-4 h-4 text-[#D92D20] flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#172B4D]">{item.fieldName}</span>
                    <span className="text-[10px] font-semibold text-[#D92D20] bg-[#FEF3F2] px-1.5 py-0.2 rounded border border-[#FECDCA]">
                      Blocking Required
                    </span>
                  </div>
                  <p className="text-xs text-[#D92D20] mt-0.5">{item.message}</p>
                  <p className="text-[10px] text-[#667085] mt-1">
                    Action: Return to Step 1 and fill in this field.
                  </p>
                </div>
              </div>
            ))}

            {/* Warnings next */}
            {warnings.map((item, idx) => (
              <div key={`warn-${idx}`} className="p-3.5 flex items-start gap-3 bg-[#FFFAEB]/40">
                <AlertCircle className="w-4 h-4 text-[#B76E00] flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#172B4D]">{item.fieldName}</span>
                    <span className="text-[10px] font-semibold text-[#B76E00] bg-[#FFFAEB] px-1.5 py-0.2 rounded border border-[#FEDF89]">
                      Warning
                    </span>
                  </div>
                  <p className="text-xs text-[#935800] mt-0.5">{item.message}</p>
                  <p className="text-[10px] text-[#667085] mt-1">
                    Action: Field will proceed with fallback defaults or prompt for field verification.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action to proceed */}
      <div className="bg-white border border-[#E4EAF2] rounded-lg p-3.5 flex items-center justify-between shadow-xs">
        <span className="text-xs text-[#667085]">
          {canProceed
            ? 'Validation verified. Proceed to configure payment hardware recommendation.'
            : 'Resolve blocking items in Step 1 to enable device recommendations.'}
        </span>
        <Button
          variant="primary"
          size="sm"
          disabled={!canProceed}
          onClick={onValid}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Continue to Devices →
        </Button>
      </div>
    </div>
  );
}
