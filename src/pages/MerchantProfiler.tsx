import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, FileCheck, CheckCircle2 } from 'lucide-react';
import { getMerchantById, getApplicationByMerchant, getRecommendationByMerchant } from '@/lib/store';
import { StepIndicator, type ProfilerStep } from '@/components/merchants/StepIndicator';
import { MerchantDetailsForm } from '@/components/merchants/MerchantDetailsForm';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { ExtractionReview } from '@/components/documents/ExtractionReview';
import { ValidationSummary } from '@/components/merchants/ValidationSummary';
import { DeviceRecommendation } from '@/components/recommendations/DeviceRecommendation';
import { ApplicationReviewForm } from '@/components/applications/ApplicationReviewForm';
import { Button } from '@/components/ui/Button';
import type { Merchant, MerchantDocument, MerchantApplication, Recommendation } from '@/types';

interface MerchantProfilerProps {
  isNew?: boolean;
}

export function MerchantProfiler({ isNew = false }: MerchantProfilerProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const existing = id ? getMerchantById(id) : undefined;
  const existingApp = id ? getApplicationByMerchant(id) : undefined;
  const existingRec = id ? getRecommendationByMerchant(id) : undefined;

  const [step, setStep] = useState<ProfilerStep>(1);
  const [completed, setCompleted] = useState<Set<ProfilerStep>>(new Set(existing ? [1 as ProfilerStep] : []));
  const [merchant, setMerchant] = useState<Merchant | undefined>(existing);
  const [document, setDocument] = useState<MerchantDocument | undefined>();
  const [recommendation, setRecommendation] = useState<Recommendation | undefined>(existingRec);
  const [application, setApplication] = useState<MerchantApplication | undefined>(existingApp);

  const completeStep = (s: ProfilerStep) => {
    setCompleted(prev => new Set([...prev, s]));
  };

  const handleMerchantSaved = (m: Merchant) => {
    setMerchant(m);
    completeStep(1);
    setStep(2);
  };

  const handleDocumentReady = (doc: MerchantDocument) => {
    setDocument(doc);
    completeStep(2);
    setStep(3);
  };

  const handleExtractionConfirmed = (doc: MerchantDocument) => {
    setDocument(doc);
    completeStep(3);
    setStep(4);
  };

  const handleValidationPassed = () => {
    completeStep(3);
    setStep(4);
  };

  const handleRecommendationConfirmed = (rec: Recommendation) => {
    setRecommendation(rec);
    completeStep(4);
    setStep(5);
  };

  const handleApplicationSaved = (app: MerchantApplication) => {
    setApplication(app);
    completeStep(5);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
      {/* Breadcrumb & Page Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-[#667085] mb-1">
          <Link to="/merchants" className="hover:text-[#002970] transition-colors">Merchants</Link>
          <ChevronRight className="w-3 h-3 text-[#98A2B3]" />
          <span className="text-[#172B4D] font-medium">
            {isNew ? 'New Merchant' : merchant?.businessName ?? 'Profile'}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-bold text-[#002970] tracking-tight">
              {isNew ? 'Create Merchant Profile' : `Onboard: ${merchant?.businessName}`}
            </h1>
            <p className="text-xs text-[#667085] mt-0.5">
              Capture business details, verify KYC documents, and configure Paytm payment devices.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate(merchant ? `/merchants/${merchant.id}` : '/merchants')}
              leftIcon={<ArrowLeft className="w-3 h-3" />}
            >
              Exit to List
            </Button>
          </div>
        </div>
      </div>

      {/* Stepper Bar */}
      <div className="bg-white border border-[#E4EAF2] rounded-lg p-2.5 shadow-xs">
        <StepIndicator
          current={step}
          completed={completed}
          onNavigate={setStep}
        />
      </div>

      {/* Step Content */}
      <div className="mt-2">
        {step === 1 && (
          <MerchantDetailsForm
            merchant={merchant}
            onSaved={handleMerchantSaved}
            onCancel={() => navigate('/merchants')}
          />
        )}

        {step === 2 && merchant && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E4EAF2] rounded-lg p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E4EAF2]">
                <div>
                  <h2 className="text-xs font-semibold text-[#172B4D] uppercase tracking-wide">
                    2. Document Upload & Visual Extraction
                  </h2>
                  <p className="text-[11px] text-[#667085]">
                    Upload a shop signboard photo, GST certificate, or electricity bill to simulate OCR auto-fill.
                  </p>
                </div>
                <span className="text-[11px] font-medium text-[#007FA5] bg-[#EBF9FE] px-2 py-0.5 rounded border border-[#B2E9FC]">
                  Simulated Vision AI
                </span>
              </div>

              <DocumentUpload
                merchant={merchant}
                onDocumentReady={handleDocumentReady}
              />
            </div>

            {/* Bottom Actions for Step 2 */}
            <div className="bg-white border border-[#E4EAF2] rounded-lg p-3.5 flex items-center justify-between shadow-xs">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                ← Back to Details
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { completeStep(2); setStep(3); }}
              >
                Skip Document · Proceed to Validation →
              </Button>
            </div>
          </div>
        )}

        {step === 3 && merchant && (
          <div className="space-y-4">
            {document && document.extractionStatus === 'completed' && document.id !== 'manual' ? (
              <ExtractionReview
                merchant={merchant}
                document={document}
                onConfirmed={handleExtractionConfirmed}
              />
            ) : (
              <ValidationSummary
                merchant={merchant}
                onValid={handleValidationPassed}
              />
            )}
            <div className="bg-white border border-[#E4EAF2] rounded-lg p-3.5 flex items-center justify-between shadow-xs">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                ← Back to Documents
              </Button>
            </div>
          </div>
        )}

        {step === 4 && merchant && (
          <div className="space-y-4">
            <DeviceRecommendation
              merchant={merchant}
              onConfirmed={handleRecommendationConfirmed}
            />
            <div className="bg-white border border-[#E4EAF2] rounded-lg p-3.5 flex items-center justify-between shadow-xs">
              <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
                ← Back to Validation
              </Button>
            </div>
          </div>
        )}

        {step === 5 && merchant && (
          <div className="space-y-4">
            <ApplicationReviewForm
              merchant={merchant}
              recommendation={recommendation}
              existingApplication={application}
              onSaved={handleApplicationSaved}
            />
            <div className="bg-white border border-[#E4EAF2] rounded-lg p-3.5 flex items-center justify-between shadow-xs">
              <Button variant="ghost" size="sm" onClick={() => setStep(4)}>
                ← Back to Recommendations
              </Button>
            </div>
          </div>
        )}

        {!merchant && step > 1 && (
          <div className="bg-white border border-[#E4EAF2] rounded-lg p-8 text-center space-y-3">
            <p className="text-xs text-[#667085]">Please complete Step 1 (Business Details) first to initialize the profile.</p>
            <Button variant="primary" size="sm" onClick={() => setStep(1)}>
              Go to Step 1
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
