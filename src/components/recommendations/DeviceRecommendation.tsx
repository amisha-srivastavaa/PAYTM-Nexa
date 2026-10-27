import { useState } from 'react';
import { MonitorSmartphone, CheckCircle2, Info, AlertTriangle, ArrowRight, Volume2, CreditCard, Sparkles, Check } from 'lucide-react';
import { generateRecommendation, SAMPLE_CATALOGUE } from '@/services/recommendation.service';
import { saveRecommendation, updateMerchant } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { AlertBanner, Card, CardHeader, CardBody, DemoNotice } from '@/components/ui/shared';
import { formatCurrency, cn } from '@/lib/utils';
import type { Merchant, Recommendation, RecommendedSetup } from '@/types';

interface DeviceRecommendationProps {
  merchant: Merchant;
  onConfirmed: (rec: Recommendation) => void;
}

function SetupCard({
  setup,
  selected,
  onSelect,
  isPrimary,
}: {
  setup: RecommendedSetup;
  selected: boolean;
  onSelect: () => void;
  isPrimary: boolean;
}) {
  return (
    <div
      className={cn(
        'border rounded-lg p-4 cursor-pointer transition-all relative',
        selected
          ? 'border-[#00BAF2] bg-[#EBF9FE]/30 ring-1 ring-[#00BAF2]'
          : 'border-[#E4EAF2] bg-white hover:border-[#CBD5E1]',
      )}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => e.key === 'Enter' && onSelect()}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] flex-shrink-0',
              selected ? 'bg-[#002970]' : 'border border-[#D0D5DD]',
            )}>
              {selected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </div>
            <h3 className="text-xs font-bold text-[#172B4D] truncate">{setup.label}</h3>
            {isPrimary ? (
              <span className="text-[10px] font-semibold text-[#87540e] bg-[#fff2dc] border border-[#f3d39f] px-1.5 py-0.2 rounded">
                AI Match
              </span>
            ) : (
              <span className="text-[10px] text-[#667085] bg-[#F2F4F7] px-1.5 py-0.2 rounded">
                Alternative
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#667085] mt-1">{setup.description}</p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-[#002970] tabular-nums">{formatCurrency(setup.totalPrice)}</p>
          <p className="text-[9px] text-[#98A2B3]">Demo catalogue price</p>
        </div>
      </div>

      {/* Devices in Setup */}
      <div className="space-y-2 mt-2">
        {setup.devices.map(device => (
          <div key={device.id} className="flex items-start gap-2.5 bg-white border border-[#E4EAF2] rounded p-2.5">
            <div className="w-7 h-7 rounded bg-[#F8F9FC] border border-[#E4EAF2] flex items-center justify-center text-[#002970] flex-shrink-0 mt-0.5">
              <MonitorSmartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-[#172B4D] truncate">{device.name}</p>
                <span className="text-xs font-bold text-[#172B4D] tabular-nums">{formatCurrency(device.price)}</span>
              </div>
              <p className="text-[11px] text-[#667085] mt-0.5">{device.description}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {device.features.map(f => (
                  <span key={f} className="text-[10px] bg-[#F2F4F7] text-[#344054] px-1.5 py-0.2 rounded">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeviceRecommendation({ merchant, onConfirmed }: DeviceRecommendationProps) {
  const [rec] = useState<Recommendation>(() => generateRecommendation(merchant));
  const [selected, setSelected] = useState<'primary' | 'alternative'>('primary');
  const [confirmed, setConfirmed] = useState(false);

  const chosenSetup = (selected === 'primary' || !rec.alternativeSetup) ? rec.recommendedSetup : rec.alternativeSetup;

  const handleConfirm = () => {
    const finalRec: Recommendation = {
      ...rec,
      recommendedSetup: chosenSetup,
    };
    saveRecommendation(finalRec);
    updateMerchant(merchant.id, {
      status: 'ready_for_submission',
    });
    setConfirmed(true);
    onConfirmed(finalRec);
  };

  const estimatedTicketSize = merchant.estimatedMonthlyVolume && merchant.estimatedTransactionsPerDay
    ? Math.round(merchant.estimatedMonthlyVolume / (merchant.estimatedTransactionsPerDay * 30))
    : undefined;

  return (
    <div className="space-y-4">
      {/* Explainable AI Reasoning Banner */}
      <div className="bg-white border border-[#E4EAF2] rounded-lg p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-[#fff2dc] text-[#87540e] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-[#00BAF2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-[#172B4D] uppercase tracking-wide">
                Why this device
              </h2>
              <span className="text-[10px] font-semibold text-[#87540e] bg-[#fff2dc] border border-[#f3d39f] px-1.5 py-0.2 rounded">
                Rule-Based AI
              </span>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-[#52677d]">
              {rec.reasons.map(reason => (
                <li key={reason} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16845B]" aria-hidden="true" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="rounded-lg bg-[#F7FCFE] p-2">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-[#71859A]">Business type</p>
                <p className="text-[11px] font-bold capitalize text-[#09254b]">{merchant.businessType}</p>
              </div>
              <div className="rounded-lg bg-[#F7FCFE] p-2">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-[#71859A]">Daily footfall</p>
                <p className="text-[11px] font-bold text-[#09254b]">{merchant.estimatedTransactionsPerDay ?? 'Not provided'} transactions</p>
              </div>
              <div className="rounded-lg bg-[#F7FCFE] p-2">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-[#71859A]">Est. ticket size</p>
                <p className="text-[11px] font-bold text-[#09254b]">{estimatedTicketSize ? `₹${estimatedTicketSize}` : 'Not provided'}</p>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-[#71859A]">Ruleset v{rec.rulesetVersion} · illustrative demo recommendation</p>
          </div>
        </div>
      </div>

      {/* Product Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <SetupCard
          setup={rec.recommendedSetup}
          selected={selected === 'primary'}
          onSelect={() => setSelected('primary')}
          isPrimary={true}
        />
        {rec.alternativeSetup && (
          <SetupCard
            setup={rec.alternativeSetup}
            selected={selected === 'alternative'}
            onSelect={() => setSelected('alternative')}
            isPrimary={false}
          />
        )}
      </div>

      {/* Catalogue Disclosure */}
      <DemoNotice>
        Payment hardware catalogue uses illustrative Paytm field pricing and device configurations for prototype evaluation.
      </DemoNotice>

      {/* Bottom Confirmation Action */}
      <div className="sticky bottom-16 z-10 bg-white border border-[#E4EAF2] rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs md:bottom-0">
        <div>
          <p className="text-xs font-semibold text-[#172B4D]">
            Selected: {chosenSetup.label}
          </p>
          <p className="text-[11px] text-[#667085]">
            Hardware package will be attached to the merchant onboarding agreement.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleConfirm}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Confirm Device Setup →
        </Button>
      </div>
    </div>
  );
}
