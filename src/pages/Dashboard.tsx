import { useNavigate } from 'react-router-dom';
import {
  Users, AlertTriangle, CheckCircle2, Calendar, TrendingUp,
  ArrowRight, Clock, ChevronRight, Store, ArrowUpRight,
  Camera, Zap, ShieldCheck,
  Sparkles,
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
  iconBg?: string;
  onClick?: () => void;
  highlight?: boolean;
}

function MetricCard({ label, value, icon, hint, iconBg = 'bg-[#E5F6FD] text-[#00BAF2]', onClick, highlight }: MetricCardProps) {
  const El = onClick ? 'button' : 'div';
  return (
    <El
      className={`bg-white border rounded-lg p-3.5 text-left w-full transition-all shadow-paytm ${
        onClick ? 'hover:border-[#00BAF2] hover:shadow-paytm-md cursor-pointer' : ''
      } ${highlight && value > 0 ? 'border-[#FEDF89] bg-[#FFFAEB]/30' : 'border-[#D8ECF8]'}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-[#5E6C84] truncate">{label}</p>
          <p className="text-xl font-bold text-[#002970] mt-1 tabular-nums tracking-tight">{value}</p>
          <p className="text-[10px] text-[#8993A4] mt-0.5 truncate">{hint}</p>
        </div>
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 border border-[#BAE7F8]`}>
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
  const today = new Date().toDateString();
  const completedToday = merchants.filter(m =>
    ['ready_for_submission', 'submitted'].includes(m.status) &&
    new Date(m.updatedAt).toDateString() === today
  ).length;
  const onboardedToday = completedToday || 4;
  const timeSavedMinutes = completedToday ? completedToday * 22 : 88;
  const dropOffsPrevented = completedToday ? Math.ceil(completedToday * 1.5) : 6;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      {/* Page Header with Paytm Light-Blue Flair */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#09254b] tracking-tight">Merchant Overview</h1>
            <span className="text-[10px] font-bold text-[#007FA5] bg-[#E1F4FD] border border-[#BAE7F8] px-2 py-0.5 rounded">
              Bengaluru Territory
            </span>
          </div>
          <p className="text-xs text-[#5E6C84] mt-0.5">
            Track merchant onboarding, pending reviews, and field follow-ups across Bengaluru territory.
          </p>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[1.5rem] border border-[#d7e9ef] bg-[linear-gradient(125deg,#ffffff_0%,#f0f9fb_60%,#e9f7f8_100%)] p-5 shadow-[0_14px_40px_rgba(9,37,75,0.07)] sm:p-7" aria-labelledby="capture-title">
        <div className="relative z-10 grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#BAE7F8] bg-[#E1F4FD] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#007FA5]">
              <Zap className="h-3 w-3" aria-hidden="true" /> Your next merchant, made easy
            </span>
            <h2 id="capture-title" className="mt-3 font-display text-2xl font-bold leading-tight text-[#09254b] sm:text-3xl">
              Capture once.<br className="hidden sm:block" /> Let NEXA do the busywork.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#52677d]">
              Photograph a storefront, review what AI reads, then get a clear device match and an onboarding-ready profile.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#52677d]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#16845B]" aria-hidden="true" /> You review every field
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5">
                <Clock className="h-3.5 w-3.5 text-[#007FA5]" aria-hidden="true" /> 25 min manual → ~3 min with NEXA
              </span>
            </div>
          </div>
          <Button
            variant="navy"
            size="lg"
            className="min-h-14 w-full rounded-2xl px-6 text-sm shadow-[0_10px_22px_rgba(9,37,75,0.18)] md:w-auto"
            leftIcon={<Camera className="h-5 w-5" />}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            onClick={() => navigate('/new-merchant')}
            aria-label="Capture a new merchant"
          >
            Capture a merchant
          </Button>
        </div>
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[28px] border-[#00b8de]/[0.07]" aria-hidden="true" />
      </section>

      <section className="grid grid-cols-1 gap-2 sm:grid-cols-3" aria-label="Illustrative impact today">
        <div className="flex items-center gap-3 rounded-2xl border border-[#D8ECF8] bg-white p-3.5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f7f9] text-[#007FA5]"><Users className="h-5 w-5" aria-hidden="true" /></span>
          <div><p className="text-[10px] font-semibold uppercase tracking-wide text-[#71859A]">Onboarded today</p><p className="font-display text-lg font-bold text-[#09254b]">{onboardedToday}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[#D8ECF8] bg-white p-3.5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E1F4FD] text-[#007FA5]"><Clock className="h-5 w-5" aria-hidden="true" /></span>
          <div><p className="text-[10px] font-semibold uppercase tracking-wide text-[#71859A]">Field time saved</p><p className="font-display text-lg font-bold text-[#09254b]">{timeSavedMinutes} min</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[#D8ECF8] bg-white p-3.5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef8f2] text-[#16845B]"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></span>
          <div><p className="text-[10px] font-semibold uppercase tracking-wide text-[#71859A]">Drop-offs prevented</p><p className="font-display text-lg font-bold text-[#09254b]">{dropOffsPrevented}</p></div>
        </div>
        <p className="text-[10px] text-[#71859A] sm:col-span-3">Illustrative demo estimates until live usage data is connected.</p>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-[#D8ECF8] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between" aria-labelledby="teammate-title">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E1F4FD] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#007FA5]">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Autonomous AI Teammate · Track 3
            </span>
            <span className="text-[10px] font-semibold text-[#71859A]">Interactive WhatsApp · ReAct simulation</span>
          </div>
          <h2 id="teammate-title" className="mt-2 text-sm font-bold text-[#09254b]">
            Watch NEXA’s AI teammate onboard a sample merchant
          </h2>
          <p className="mt-1 text-xs text-[#52677d]">
            Explore a simulated WhatsApp conversation, document read, device recommendation, and application preparation.
          </p>
        </div>
        <button
          onClick={() => navigate('/agent-demo')}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#09254b] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#001f56] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00BAF2]"
        >
          <span>Launch Agent Simulator</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </section>

      {/* Demo Notice */}
      <DemoNotice>
        Local prototype data only. No live merchant systems or Paytm submission services are connected.
      </DemoNotice>

      {/* Key Metrics Row (4 metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Total Merchants"
          value={metrics.totalMerchants}
          icon={<Users className="w-4 h-4 text-[#00BAF2]" />}
          iconBg="bg-[#E5F6FD] text-[#00BAF2]"
          hint="Assigned in territory"
          onClick={() => navigate('/merchants')}
        />
        <MetricCard
          label="Pending Review"
          value={metrics.needsReview}
          icon={<AlertTriangle className="w-4 h-4 text-[#B76E00]" />}
          iconBg="bg-[#FFFAEB] text-[#B76E00]"
          hint="Action required"
          onClick={() => navigate('/merchants?filter=needs_review')}
          highlight
        />
        <MetricCard
          label="Ready for Submission"
          value={metrics.readyForSubmission}
          icon={<CheckCircle2 className="w-4 h-4 text-[#16845B]" />}
          iconBg="bg-[#ECFDF5] text-[#16845B]"
          hint="Verified applications"
          onClick={() => navigate('/applications')}
        />
        <MetricCard
          label="Follow-ups Due"
          value={metrics.followUpsDue}
          icon={<Calendar className="w-4 h-4 text-[#00BAF2]" />}
          iconBg="bg-[#EAF6FD] text-[#00BAF2]"
          hint="Pending merchant visits"
          onClick={() => navigate('/follow-ups')}
        />
      </div>

      {/* Main Content: Balanced Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Recent Merchant Activity (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Recent Merchant Activity Table */}
          <div className="bg-white border border-[#D8ECF8] rounded-lg shadow-paytm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#D8ECF8] bg-[#F7FCFE] flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-[#002970]">Recent Merchant Activity</h2>
                <p className="text-[10px] text-[#5E6C84]">Recently profiled and updated storefronts</p>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => navigate('/merchants')}
                rightIcon={<ArrowRight className="w-3 h-3 text-[#00BAF2]" />}
              >
                View Directory
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs" aria-label="Recent merchants table">
                <thead>
                  <tr className="border-b border-[#D8ECF8] bg-[#F2F9FD] text-[#002970]">
                    <th className="text-left px-3.5 py-2.5 font-bold">Merchant</th>
                    <th className="text-left px-3.5 py-2.5 font-bold">Category</th>
                    <th className="text-left px-3.5 py-2.5 font-bold">Last Updated</th>
                    <th className="text-left px-3.5 py-2.5 font-bold">Status</th>
                    <th className="text-right px-3.5 py-2.5 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8ECF8]">
                  {merchants.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-12 text-center">
                      <Store className="mx-auto h-8 w-8 text-[#00b8de]" aria-hidden="true" />
                      <p className="mt-2 text-sm font-semibold text-[#09254b]">Your merchant list is ready for its first story.</p>
                      <button className="mt-2 text-xs font-bold text-[#007FA5] underline" onClick={() => navigate('/new-merchant')}>Capture a merchant</button>
                    </td></tr>
                  ) : merchants.slice(0, 6).map(m => (
                    <tr key={m.id} className="hover:bg-[#F5FBFE] transition-colors">
                      <td className="px-3.5 py-2.5">
                        <p className="font-bold text-[#002970] truncate">{m.businessName}</p>
                        <p className="text-[10px] text-[#5E6C84] truncate">{m.address.city} · {m.ownerName}</p>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="text-[11px] text-[#005B7A] capitalize bg-[#EBF7FD] border border-[#BAE7F8] px-1.5 py-0.5 rounded font-medium">
                          {m.businessType}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-[#5E6C84] text-[11px]">
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
          <div className="bg-white border border-[#D8ECF8] rounded-lg shadow-paytm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#D8ECF8] bg-[#F7FCFE]">
              <h2 className="text-xs font-bold text-[#002970]">Field Action Stream</h2>
            </div>
            <div className="divide-y divide-[#D8ECF8]">
              {activity.slice(0, 5).map((act, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-[#F5FBFE]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#00BAF2] flex-shrink-0" />
                    <p className="text-[#172B4D] truncate">
                      <strong className="text-[#002970] font-semibold">{act.merchantName}</strong> — {act.action}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#8993A4] flex-shrink-0 ml-2 font-medium">{timeAgo(act.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pending Actions & Pipeline (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Onboarding Progress Summary */}
          <div className="bg-white border border-[#D8ECF8] rounded-lg p-4 shadow-paytm space-y-3">
            <h2 className="text-xs font-bold text-[#002970] uppercase tracking-wide">
              Onboarding Pipeline Funnel
            </h2>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-lg bg-[#E5F6FD] border border-[#BAE7F8]">
                <p className="text-sm font-bold text-[#00BAF2] tabular-nums">{newCount}</p>
                <p className="text-[10px] text-[#007FA5] font-semibold mt-0.5">New</p>
              </div>
              <div className="p-2 rounded-lg bg-[#FFFAEB] border border-[#FEDF89]">
                <p className="text-sm font-bold text-[#B76E00] tabular-nums">{reviewCount}</p>
                <p className="text-[10px] text-[#B76E00] font-semibold mt-0.5">Review</p>
              </div>
              <div className="p-2 rounded-lg bg-[#ECFDF5] border border-[#A6F4C5]">
                <p className="text-sm font-bold text-[#16845B] tabular-nums">{readyCount}</p>
                <p className="text-[10px] text-[#16845B] font-semibold mt-0.5">Ready</p>
              </div>
              <div className="p-2 rounded-lg bg-[#F0F8FD] border border-[#D8ECF8]">
                <p className="text-sm font-bold text-[#002970] tabular-nums">{submittedCount}</p>
                <p className="text-[10px] text-[#5E6C84] font-semibold mt-0.5">Submitted</p>
              </div>
            </div>
          </div>

          {/* Pending Actions Section */}
          <div className="bg-white border border-[#D8ECF8] rounded-lg shadow-paytm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#D8ECF8] bg-[#F7FCFE] flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-[#002970]">Pending Review Queue</h2>
                <p className="text-[10px] text-[#5E6C84]">Merchants requiring documents or checks</p>
              </div>
              <span className="text-[10px] font-bold text-[#B76E00] bg-[#FFFAEB] px-2 py-0.5 rounded border border-[#FEDF89]">
                {incompleteMerchants.length} pending
              </span>
            </div>

            <div className="divide-y divide-[#D8ECF8]">
              {incompleteMerchants.slice(0, 4).map(m => (
                <div key={m.id} className="p-3 flex items-center justify-between gap-2 hover:bg-[#F5FBFE]">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#002970] truncate">{m.businessName}</p>
                    <p className="text-[10px] text-[#5E6C84] truncate">{m.address.city} · {m.phone}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => navigate(`/merchants/${m.id}/edit`)}
                    rightIcon={<ArrowRight className="w-3 h-3 text-[#00BAF2]" />}
                  >
                    Resume
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-ups Due */}
          <div className="bg-white border border-[#D8ECF8] rounded-lg shadow-paytm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#D8ECF8] bg-[#F7FCFE] flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-[#002970]">Upcoming Field Visits</h2>
                <p className="text-[10px] text-[#5E6C84]">Follow-ups scheduled for today</p>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => navigate('/follow-ups')}
              >
                All
              </Button>
            </div>

            <div className="divide-y divide-[#D8ECF8]">
              {pendingVisits.map(v => (
                <div key={v.id} className="p-3 flex items-start justify-between gap-2 hover:bg-[#F5FBFE]">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#002970] truncate">{v.merchantName}</p>
                    <p className="text-[10px] text-[#00BAF2] font-semibold">{formatDateTime(v.scheduledAt)}</p>
                    {v.reason && <p className="text-[10px] text-[#5E6C84] truncate mt-0.5">{v.reason}</p>}
                  </div>
                  <span className="text-[10px] font-semibold text-[#007FA5] bg-[#E1F4FD] border border-[#BAE7F8] px-1.5 py-0.5 rounded capitalize flex-shrink-0">
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
