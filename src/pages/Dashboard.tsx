import { useNavigate } from 'react-router-dom';
import {
  Users, AlertTriangle, CheckCircle2, Calendar, TrendingUp,
  ArrowRight, UserPlus, Clock, ChevronRight, Store, ArrowUpRight,
  Sparkles, Bot,
} from 'lucide-react';
import {
  getDashboardMetrics,
  getMerchants,
  getActivity,
  getUpcomingVisits,
  getApplications,
} from '@/lib/store';
import { MerchantStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CompletenessBar, DemoNotice } from '@/components/ui/shared';
import { formatDateTime, timeAgo, formatDate } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  hint: string;
  onClick?: () => void;
  highlight?: boolean;
}

function MetricCard({ label, value, icon, hint, onClick, highlight }: MetricCardProps) {
  const El = onClick ? 'button' : 'div';
  return (
    <El
      className={`bg-white border rounded-lg p-3.5 text-left w-full transition-all shadow-xs ${
        onClick ? 'hover:border-[#00BAF2] hover:shadow-sm cursor-pointer' : ''
      } ${highlight && value > 0 ? 'border-[#FEDF89] bg-[#FFFAEB]/30' : 'border-[#E4EAF2]'}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-[#667085] truncate">{label}</p>
          <p className="text-xl font-bold text-[#172B4D] mt-1 tabular-nums tracking-tight">{value}</p>
          <p className="text-[10px] text-[#98A2B3] mt-0.5 truncate">{hint}</p>
        </div>
        <div className="w-8 h-8 rounded-md bg-[#EDF3FB] text-[#002970] flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      </div>
    </El>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const metrics = getDashboardMetrics();
  const merchants = getMerchants();
  const activity = getActivity();
  const visits = getUpcomingVisits();
  const apps = getApplications();

  // Pending actions items
  const incompleteMerchants = merchants.filter(m => m.status === 'incomplete' || m.status === 'needs_review');
  const readyApps = apps.filter(a => a.status === 'ready_for_review');
  const pendingVisits = visits.slice(0, 4);

  // Status breakdown calculation
  const total = merchants.length || 1;
  const newCount = merchants.filter(m => m.status === 'new').length;
  const reviewCount = merchants.filter(m => m.status === 'needs_review' || m.status === 'incomplete').length;
  const readyCount = merchants.filter(m => m.status === 'ready_for_submission').length;
  const submittedCount = merchants.filter(m => m.status === 'submitted').length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-[#002970] tracking-tight">Merchant Overview</h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Track merchant onboarding, pending reviews, and field follow-ups across Bengaluru territory.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          onClick={() => navigate('/new-merchant')}
        >
          Add Merchant
        </Button>
      </div>

      {/* Autonomous AI Teammate Flagship Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#002970] via-[#003896] to-[#0055c9] p-4 text-white shadow-sm border border-[#002970]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#00BAF2] text-[#002970] uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#002970]" />
                Autonomous AI Teammate · Track 3
              </span>
              <span className="text-[11px] text-[#B2E9FC] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00BAF2] animate-ping" />
                Live WhatsApp & ReAct Simulation
              </span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Watch NEXA Autonomously Onboard Raju General Store on WhatsApp
            </h2>
            <p className="text-xs text-[#E0EDFB] leading-relaxed">
              Experience the autonomous ReAct loop: reading documents from camera photos, overcoming objections in Hinglish, recommending the Soundbox, and pushing pre-verified applications into this dashboard.
            </p>
          </div>
          <button
            onClick={() => navigate('/agent-demo')}
            className="flex-shrink-0 px-4 py-2 bg-[#00BAF2] hover:bg-[#00a8dc] text-[#002970] text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <span>Launch Agent Simulator</span>
            <ArrowRight className="w-4 h-4 text-[#002970]" />
          </button>
        </div>
      </div>

      {/* Demo Notice */}
      <DemoNotice>
        Operational metrics reflect seeded prototype records. Field sales workflow simulation is active.
      </DemoNotice>

      {/* Key Metrics Row (4 metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Total Merchants"
          value={metrics.totalMerchants}
          icon={<Users className="w-4 h-4 text-[#002970]" />}
          hint="Assigned in territory"
          onClick={() => navigate('/merchants')}
        />
        <MetricCard
          label="Pending Review"
          value={metrics.needsReview}
          icon={<AlertTriangle className="w-4 h-4 text-[#B76E00]" />}
          hint="Action required"
          onClick={() => navigate('/merchants?filter=needs_review')}
          highlight
        />
        <MetricCard
          label="Ready for Submission"
          value={metrics.readyForSubmission}
          icon={<CheckCircle2 className="w-4 h-4 text-[#16845B]" />}
          hint="Verified applications"
          onClick={() => navigate('/applications')}
        />
        <MetricCard
          label="Follow-ups Due"
          value={metrics.followUpsDue}
          icon={<Calendar className="w-4 h-4 text-[#00BAF2]" />}
          hint="Pending merchant visits"
          onClick={() => navigate('/follow-ups')}
        />
      </div>

      {/* Main Content: Balanced Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Recent Merchant Activity (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Recent Merchant Activity Table */}
          <div className="bg-white border border-[#E4EAF2] rounded-lg shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E4EAF2] flex items-center justify-between">
              <div>
                <h2 className="text-xs font-semibold text-[#172B4D]">Recent Merchant Activity</h2>
                <p className="text-[10px] text-[#667085]">Recently profiled and updated storefronts</p>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => navigate('/merchants')}
                rightIcon={<ArrowRight className="w-3 h-3" />}
              >
                View Directory
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs" aria-label="Recent merchants table">
                <thead>
                  <tr className="border-b border-[#E4EAF2] bg-[#FAFCFE] text-[#667085]">
                    <th className="text-left px-3.5 py-2 font-medium">Merchant</th>
                    <th className="text-left px-3.5 py-2 font-medium">Category</th>
                    <th className="text-left px-3.5 py-2 font-medium">Last Updated</th>
                    <th className="text-left px-3.5 py-2 font-medium">Status</th>
                    <th className="text-right px-3.5 py-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4EAF2]">
                  {merchants.slice(0, 6).map(m => (
                    <tr key={m.id} className="hover:bg-[#F8F9FC] transition-colors">
                      <td className="px-3.5 py-2.5">
                        <p className="font-semibold text-[#172B4D] truncate">{m.businessName}</p>
                        <p className="text-[10px] text-[#667085] truncate">{m.address.city} · {m.ownerName}</p>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="text-[11px] text-[#344054] capitalize bg-[#F2F4F7] px-1.5 py-0.5 rounded">
                          {m.businessType}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-[#667085] text-[11px]">
                        {timeAgo(m.updatedAt)}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <MerchantStatusBadge status={m.status} />
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => navigate(`/merchants/${m.id}`)}
                        >
                          Profile
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational Log / Event Stream */}
          <div className="bg-white border border-[#E4EAF2] rounded-lg shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E4EAF2]">
              <h2 className="text-xs font-semibold text-[#172B4D]">Field Action Stream</h2>
            </div>
            <div className="divide-y divide-[#E4EAF2]">
              {activity.slice(0, 5).map((act, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-[#FAFCFE]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00BAF2] flex-shrink-0" />
                    <p className="text-[#172B4D] truncate">
                      <strong className="text-[#002970]">{act.merchantName}</strong> — {act.action}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#98A2B3] flex-shrink-0 ml-2">{timeAgo(act.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pending Actions & Pipeline (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Onboarding Progress Summary */}
          <div className="bg-white border border-[#E4EAF2] rounded-lg p-4 shadow-xs space-y-3">
            <h2 className="text-xs font-semibold text-[#172B4D] uppercase tracking-wide">
              Onboarding Pipeline Funnel
            </h2>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded bg-[#EBF9FE] border border-[#B2E9FC]">
                <p className="text-sm font-bold text-[#002970] tabular-nums">{newCount}</p>
                <p className="text-[10px] text-[#007FA5] font-medium mt-0.5">New</p>
              </div>
              <div className="p-2 rounded bg-[#FFFAEB] border border-[#FEDF89]">
                <p className="text-sm font-bold text-[#B76E00] tabular-nums">{reviewCount}</p>
                <p className="text-[10px] text-[#B76E00] font-medium mt-0.5">Review</p>
              </div>
              <div className="p-2 rounded bg-[#ECFDF3] border border-[#A6F4C5]">
                <p className="text-sm font-bold text-[#16845B] tabular-nums">{readyCount}</p>
                <p className="text-[10px] text-[#16845B] font-medium mt-0.5">Ready</p>
              </div>
              <div className="p-2 rounded bg-[#F8F9FC] border border-[#E4EAF2]">
                <p className="text-sm font-bold text-[#344054] tabular-nums">{submittedCount}</p>
                <p className="text-[10px] text-[#667085] font-medium mt-0.5">Submitted</p>
              </div>
            </div>
          </div>

          {/* Pending Actions Section */}
          <div className="bg-white border border-[#E4EAF2] rounded-lg shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E4EAF2] flex items-center justify-between">
              <div>
                <h2 className="text-xs font-semibold text-[#172B4D]">Pending Review Queue</h2>
                <p className="text-[10px] text-[#667085]">Merchants requiring documents or checks</p>
              </div>
              <span className="text-[10px] font-semibold text-[#B76E00] bg-[#FFFAEB] px-1.5 py-0.2 rounded border border-[#FEDF89]">
                {incompleteMerchants.length} pending
              </span>
            </div>

            <div className="divide-y divide-[#E4EAF2]">
              {incompleteMerchants.slice(0, 4).map(m => (
                <div key={m.id} className="p-3 flex items-center justify-between gap-2 hover:bg-[#FAFCFE]">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#172B4D] truncate">{m.businessName}</p>
                    <p className="text-[10px] text-[#667085] truncate">{m.address.city} · {m.phone}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => navigate(`/merchants/${m.id}/edit`)}
                    rightIcon={<ArrowRight className="w-3 h-3" />}
                  >
                    Resume
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-ups Due */}
          <div className="bg-white border border-[#E4EAF2] rounded-lg shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E4EAF2] flex items-center justify-between">
              <div>
                <h2 className="text-xs font-semibold text-[#172B4D]">Upcoming Field Visits</h2>
                <p className="text-[10px] text-[#667085]">Follow-ups scheduled for today</p>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => navigate('/follow-ups')}
              >
                All
              </Button>
            </div>

            <div className="divide-y divide-[#E4EAF2]">
              {pendingVisits.map(v => (
                <div key={v.id} className="p-3 flex items-start justify-between gap-2 hover:bg-[#FAFCFE]">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#172B4D] truncate">{v.merchantName}</p>
                    <p className="text-[10px] text-[#002970] font-medium">{formatDateTime(v.scheduledAt)}</p>
                    {v.reason && <p className="text-[10px] text-[#667085] truncate mt-0.5">{v.reason}</p>}
                  </div>
                  <span className="text-[10px] text-[#007FA5] bg-[#EBF9FE] px-1.5 py-0.5 rounded capitalize flex-shrink-0">
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
