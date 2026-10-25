import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, CheckCircle2, Clock, Check } from 'lucide-react';
import { getVisits, getMerchants, updateVisit } from '@/lib/store';
import { VisitStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, DemoNotice } from '@/components/ui/shared';
import { formatDateTime } from '@/lib/utils';
import type { MerchantVisit, VisitStatus } from '@/types';

export function FollowUps() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<MerchantVisit[]>(() => getVisits());
  const merchants = getMerchants();

  const upcoming = visits.filter(v => v.status === 'scheduled').sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  const past = visits.filter(v => v.status !== 'scheduled').sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt)).slice(0, 8);

  const handleStatusChange = (id: string, status: VisitStatus) => {
    updateVisit(id, { status });
    setVisits(getVisits());
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-[#002970] tracking-tight">Merchant Follow-ups & Visits</h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Territory visit queue, merchant verification check-ins, and Soundbox deployments.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/route-planner')}
        >
          Open Route Planner
        </Button>
      </div>

      <DemoNotice>
        Visits reflect prototype field itineraries. Marking visits updates in-memory prototype status.
      </DemoNotice>

      {/* Upcoming Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-[#172B4D] uppercase tracking-wide">
          Upcoming Scheduled Visits ({upcoming.length})
        </h2>

        {upcoming.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-6 h-6 text-[#98A2B3]" />}
            title="No upcoming visits scheduled"
            description="Use Route Planner to add merchant visits to your field schedule."
          />
        ) : (
          <div className="space-y-2">
            {upcoming.map(visit => {
              const merchant = merchants.find(m => m.id === visit.merchantId);
              return (
                <div
                  key={visit.id}
                  className="bg-white border border-[#E4EAF2] rounded-lg p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#CBD5E1] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-[#EDF3FB] border border-[#D0E1F9] flex items-center justify-center text-[#002970] flex-shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-[#172B4D]">{visit.merchantName}</h3>
                        <VisitStatusBadge status={visit.status} />
                      </div>
                      <p className="text-[11px] text-[#002970] font-medium mt-0.5">
                        {formatDateTime(visit.scheduledAt)}
                      </p>
                      {visit.reason && (
                        <p className="text-[11px] text-[#667085] mt-0.5">{visit.reason}</p>
                      )}
                      {merchant && (
                        <p className="text-[10px] text-[#98A2B3] flex items-center gap-1 mt-1">
                          <MapPin className="w-2.5 h-2.5" />
                          {merchant.address.line1}, {merchant.address.city}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => navigate(`/merchants/${visit.merchantId}`)}
                    >
                      Dossier
                    </Button>
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => handleStatusChange(visit.id, 'completed')}
                      leftIcon={<Check className="w-3 h-3 text-[#16845B]" />}
                    >
                      Mark Done
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Completed Visits */}
      {past.length > 0 && (
        <div className="space-y-3 pt-3">
          <h2 className="text-xs font-semibold text-[#172B4D] uppercase tracking-wide">
            Recent Visit History
          </h2>
          <div className="bg-white border border-[#E4EAF2] rounded-lg shadow-xs overflow-hidden divide-y divide-[#E4EAF2]">
            {past.map(v => (
              <div key={v.id} className="p-3 flex items-center justify-between text-xs hover:bg-[#FAFCFE]">
                <div>
                  <p className="font-semibold text-[#172B4D]">{v.merchantName}</p>
                  <p className="text-[10px] text-[#667085]">{formatDateTime(v.scheduledAt)}</p>
                </div>
                <VisitStatusBadge status={v.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
