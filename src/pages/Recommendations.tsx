import { useNavigate } from 'react-router-dom';
import { MonitorSmartphone, CheckCircle2, Info, ArrowRight, Sparkles } from 'lucide-react';
import { getMerchants, getRecommendations } from '@/lib/store';
import { SAMPLE_CATALOGUE } from '@/services/recommendation.service';
import { Button } from '@/components/ui/Button';
import { DemoNotice, EmptyState } from '@/components/ui/shared';
import { formatCurrency } from '@/lib/utils';

export function RecommendationsPage() {
  const navigate = useNavigate();
  const recs = getRecommendations();
  const merchants = getMerchants();

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-[#002970] tracking-tight">Paytm Payment Devices</h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Hardware catalogue and merchant-specific AI recommendation matches.
          </p>
        </div>
      </div>

      <DemoNotice>
        Catalogue configurations and illustrative hardware pricing are provided for hackathon demonstration.
      </DemoNotice>

      {/* Hardware Catalogue Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-[#172B4D] uppercase tracking-wide">
          Standard Field Hardware Catalogue
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_CATALOGUE.map(device => (
            <div key={device.id} className="bg-white border border-[#E4EAF2] rounded-lg p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-8 h-8 rounded bg-[#EDF3FB] border border-[#D0E1F9] flex items-center justify-center text-[#002970]">
                    <MonitorSmartphone className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-[#007FA5] bg-[#EBF9FE] px-1.5 py-0.2 rounded border border-[#B2E9FC]">
                    Official Series
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[#172B4D]">{device.name}</h3>
                <p className="text-[11px] text-[#667085] mt-0.5 leading-snug">{device.description}</p>

                <ul className="space-y-1.5 mt-3 pt-3 border-t border-[#E4EAF2]">
                  {device.features.map(f => (
                    <li key={f} className="flex items-start gap-1.5 text-[11px] text-[#344054]">
                      <CheckCircle2 className="w-3 h-3 text-[#16845B] flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E4EAF2]">
                <div>
                  <p className="text-xs font-bold text-[#002970] tabular-nums">{formatCurrency(device.price)}</p>
                  <p className="text-[9px] text-[#98A2B3]">Illustrative price</p>
                </div>
                <span className="text-[10px] text-[#667085] bg-[#F8F9FC] px-1.5 py-0.5 rounded border border-[#E4EAF2]">
                  Hardware
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deployed Merchant Recommendations */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xs font-semibold text-[#172B4D] uppercase tracking-wide">
          Recent Territory Recommendation Matches
        </h2>

        {recs.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="w-6 h-6 text-[#98A2B3]" />}
            title="No merchant recommendations generated yet"
            description="Run the 5-step onboarding wizard on any merchant to trigger automated product selection."
            action={<Button variant="primary" size="sm" onClick={() => navigate('/new-merchant')}>New Merchant</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recs.map((r, i) => {
              const m = merchants.find(x => x.id === r.merchantId);
              return (
                <div key={i} className="bg-white border border-[#E4EAF2] rounded-lg p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-[#172B4D] truncate">{m?.businessName ?? 'Merchant'}</p>
                      <p className="text-[10px] text-[#667085] capitalize">{m?.businessType} · {m?.address.city}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#16845B] bg-[#ECFDF3] border border-[#A6F4C5] px-1.5 py-0.2 rounded">
                      AI Match
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#FAFCFE] border border-[#E4EAF2] rounded space-y-1">
                    <p className="text-xs font-semibold text-[#002970]">{r.recommendedSetup.label}</p>
                    <p className="text-[11px] text-[#667085]">{r.recommendedSetup.description}</p>
                  </div>

                  <p className="text-[10px] text-[#667085] italic">
                    Reason: {r.reasons.join('. ')}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E4EAF2]">
                    <span className="text-xs font-bold text-[#172B4D]">
                      {formatCurrency(r.recommendedSetup.totalPrice)}
                    </span>
                    {m && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => navigate(`/merchants/${m.id}`)}
                        rightIcon={<ArrowRight className="w-3 h-3" />}
                      >
                        Merchant Dossier
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
