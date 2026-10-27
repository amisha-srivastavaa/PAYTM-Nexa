import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Clock3 } from 'lucide-react';
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

function ReadinessRing({ value }: { value: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(value, 100));
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-[#D8ECF8] bg-white px-3 py-2 shadow-sm" role="img" aria-label={`Merchant readiness ${progress}%`}>
      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 52 52" aria-hidden="true">
        <circle cx="26" cy="26" r={radius} fill="none" stroke="var(--border)" strokeWidth="5" />
        <circle
          className="readiness-ring"
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke={progress === 100 ? 'var(--success)' : 'var(--brand-cyan)'}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress / 100)}
        />
      </svg>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#71859A]">Readiness</p>
        <p className="font-display text-lg font-bold leading-tight text-[#09254b]">{progress}%</p>
      </div>
    </div>
  );
}

export function MerchantProfiler({ isNew = false }: MerchantProfilerProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const demoJourney = searchParams.get('demo') === '1';

  const existing = id ? getMerchantById(id) : undefined;
  const existingApp = id ? getApplicationByMerchant(id) : undefined;
  const existingRec = id ? getRecommendationByMerchant(id) : undefined;

  const [step, setStep] = useState<ProfilerStep>(() => demoJourney && existing ? 2 : 1);
  const [completed, setCompleted] = useState<Set<ProfilerStep>>(new Set(existing ? [1 as ProfilerStep] : []));
  const [merchant, setMerchant] = useState<Merchant | undefined>(existing);
  const [document, setDocument] = useState<MerchantDocument | undefined>();
  const [recommendation, setRecommendation] = useState<Recommendation | undefined>(existingRec);
  const [application, setApplication] = useState<MerchantApplication | undefined>(existingApp);
  const startedAt = useRef(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const previewUrl = document?.previewUrl;
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [document?.previewUrl]);

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
    if (merchant) setMerchant(getMerchantById(merchant.id) ?? merchant);
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

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const readiness = application?.readinessChecks.length
    ? Math.round((application.readinessChecks.filter(check => check.passed).length / application.readinessChecks.length) * 100)
    : merchant?.completeness ?? 0;

  return (
    <div className="p-4 pb-8 sm:p-6 max-w-5xl mx-auto space-y-4">
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
            <h1 className="text-xl sm:text-2xl font-bold text-[#09254b] tracking-tight">
              {isNew ? 'Capture a merchant' : `Onboard ${merchant?.businessName}`}
            </h1>
            <p className="text-sm text-[#667085] mt-1">
              {demoJourney ? 'A sample storefront is ready. Review its AI-read details, then finish the simulated flow.' : 'One quick profile, a document scan, and a clear next step.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ReadinessRing value={readiness} />
            <span className="flex items-center gap-1.5 rounded-full border border-[#D8ECF8] bg-white px-2.5 py-2 text-[10px] sm:text-xs font-semibold text-[#52677d]" aria-live="off">
              <Clock3 className="h-3.5 w-3.5 text-[#00b8de]" />
              {elapsedSeconds < 180
                ? `Profile ready in ${Math.floor((180 - elapsedSeconds) / 60)}m ${String((180 - elapsedSeconds) % 60).padStart(2, '0')}s`
                : `${minutes}:${String(seconds).padStart(2, '0')} elapsed`}
            </span>
            <span className="hidden lg:inline rounded-full bg-[#f4f8fb] px-3 py-2 text-[10px] font-semibold text-[#52677d]">
              Manual 25 min <span className="text-[#00b8de]">→</span> NEXA 3 min
            </span>
            <Button
              variant="outline"
              size="sm"
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
                <span className="text-[11px] font-semibold text-[#87540e] bg-[#fff2dc] px-2 py-1 rounded-full border border-[#f3d39f]">
                  AI extraction demo
                </span>
              </div>

              <DocumentUpload
                merchant={merchant}
                onDocumentReady={handleDocumentReady}
                demoMode={demoJourney}
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
