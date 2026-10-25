import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, ArrowUp, ArrowDown, Plus, Map, Info } from 'lucide-react';
import { getVisits, getMerchants } from '@/lib/store';
import { VisitStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, DemoNotice } from '@/components/ui/shared';
import { formatDateTime } from '@/lib/utils';
import type { MerchantVisit } from '@/types';

export function RoutePlanner() {
  const navigate = useNavigate();
  const merchants = getMerchants();
  const [itinerary, setItinerary] = useState<MerchantVisit[]>(() =>
    getVisits().filter(v => v.status === 'scheduled').sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
  );

  const moveUp = (index: number) => {
    if (index === 0) return;
    const arr = [...itinerary];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    setItinerary(arr);
  };

  const moveDown = (index: number) => {
    if (index === itinerary.length - 1) return;
    const arr = [...itinerary];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    setItinerary(arr);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-[#002970] tracking-tight">Field Visit Route Planner</h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Sequence merchant visits and optimize daily field acquisition routing.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/follow-ups')}
        >
          View Follow-ups Queue
        </Button>
      </div>

      <DemoNotice>
        Sample itinerary planner. No external mapping provider or live traffic calculations connected.
      </DemoNotice>

      {itinerary.length === 0 ? (
        <EmptyState
          icon={<MapPin className="w-6 h-6 text-[#98A2B3]" />}
          title="No scheduled visits in itinerary"
          description="Schedule follow-ups on merchant dossiers to sequence field stops."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Stop List (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-[#172B4D] uppercase tracking-wide">
                Visit Itinerary ({itinerary.length} Stops)
              </h2>
              <span className="text-[10px] text-[#667085]">Use arrows to adjust field order</span>
            </div>

            <div className="space-y-2">
              {itinerary.map((visit, i) => {
                const merchant = merchants.find(m => m.id === visit.merchantId);
                return (
                  <div
                    key={visit.id}
                    className="bg-white border border-[#E4EAF2] rounded-lg p-3.5 shadow-xs flex items-center justify-between gap-3 hover:border-[#CBD5E1] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Step index pill */}
                      <div className="w-7 h-7 rounded-full bg-[#002970] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-[#172B4D] truncate">{visit.merchantName}</h3>
                          <VisitStatusBadge status={visit.status} />
                        </div>
                        <p className="text-[11px] text-[#002970] font-medium mt-0.5">
                          {formatDateTime(visit.scheduledAt)}
                        </p>
                        {merchant && (
                          <p className="text-[10px] text-[#667085] truncate mt-0.5 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-[#98A2B3]" />
                            {merchant.address.line1}, {merchant.address.city}
                          </p>
                        )}
                        {visit.reason && (
                          <p className="text-[10px] text-[#667085] italic mt-0.5">Note: {visit.reason}</p>
                        )}
                      </div>
                    </div>

                    {/* Reordering Controls */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => moveUp(i)}
                        disabled={i === 0}
                        className="w-7 h-7 flex items-center justify-center rounded border border-[#E4EAF2] text-[#667085] hover:bg-[#F5F8FC] hover:text-[#172B4D] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        title="Move up in route"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveDown(i)}
                        disabled={i === itinerary.length - 1}
                        className="w-7 h-7 flex items-center justify-center rounded border border-[#E4EAF2] text-[#667085] hover:bg-[#F5F8FC] hover:text-[#172B4D] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        title="Move down in route"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Territory Context Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-[#E4EAF2] rounded-lg p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E4EAF2]">
                <Navigation className="w-4 h-4 text-[#002970]" />
                <h3 className="text-xs font-semibold text-[#172B4D]">Territory Operations</h3>
              </div>
              <div className="space-y-1.5 text-xs text-[#344054]">
                <p><strong className="text-[#172B4D]">Assigned Zone:</strong> Bengaluru Central</p>
                <p><strong className="text-[#172B4D]">Daily Route Stops:</strong> {itinerary.length} merchants</p>
                <p><strong className="text-[#172B4D]">Coordinates Available:</strong> {itinerary.filter(v => v.coordinates).length} locations</p>
              </div>

              <div className="p-2.5 bg-[#FAFCFE] border border-[#E4EAF2] rounded text-[11px] text-[#667085] space-y-1">
                <p className="font-semibold text-[#172B4D]">Field Routing Protocol</p>
                <p>Prioritize merchants requiring KYC documentation and Soundbox battery replacement during morning hours.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
