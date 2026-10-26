import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, ChevronDown, RotateCcw, Info, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMerchants, resetDemoStore } from '@/lib/store';

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; businessName: string; status: string; city: string }>>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const merchants = getMerchants();
    const filtered = merchants.filter(m =>
      m.businessName.toLowerCase().includes(q.toLowerCase()) ||
      m.phone.includes(q) ||
      m.ownerName.toLowerCase().includes(q.toLowerCase()) ||
      m.address.city.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 5);
    setResults(filtered.map(m => ({ id: m.id, businessName: m.businessName, status: m.status, city: m.address.city })));
  };

  const handleSelect = (id: string) => {
    setQuery('');
    setResults([]);
    navigate(`/merchants/${id}`);
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo data to initial seed records? This will restore the prototype database to its default state.')) {
      resetDemoStore();
      window.location.reload();
    }
  };

  return (
    <>
      <header className="h-12 flex-shrink-0 bg-white border-b border-[#E4EAF2] flex items-center px-4 gap-3 z-20" role="banner">
        {/* Page Title / Breadcrumb Context */}
        <div className="flex items-center gap-2 min-w-[140px]">
          <span className="text-xs font-semibold text-[#172B4D]">{title}</span>
        </div>

        {/* Global Merchant Search */}
        <div className="relative flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#98A2B3]" aria-hidden />
            <input
              type="search"
              placeholder="Search merchants by name, owner, or city…"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => query && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              className={cn(
                'w-full h-7.5 pl-8 pr-3 text-xs border border-[#E4EAF2] rounded bg-[#F8F9FC] text-[#172B4D] placeholder:text-[#98A2B3]',
                'focus:outline-none focus:ring-1.5 focus:ring-[#00BAF2] focus:border-[#00BAF2] focus:bg-white transition-colors',
              )}
              aria-label="Search merchants"
              aria-autocomplete="list"
              aria-expanded={results.length > 0}
            />
          </div>
          {results.length > 0 && showDropdown !== false && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-[#E4EAF2] rounded-md shadow-md z-50 py-1" role="listbox">
              {results.map(r => (
                <button
                  key={r.id}
                  role="option"
                  className="w-full px-3 py-1.5 text-left hover:bg-[#F5F8FC] flex items-center justify-between transition-colors"
                  onClick={() => handleSelect(r.id)}
                >
                  <div className="truncate pr-2">
                    <p className="font-medium text-[#172B4D] text-xs truncate">{r.businessName}</p>
                    <p className="text-[10px] text-[#667085]">{r.city}</p>
                  </div>
                  <span className="text-[10px] text-[#007FA5] bg-[#EBF9FE] px-1.5 py-0.5 rounded capitalize flex-shrink-0">
                    {r.status.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Autonomous Agent Demo CTA */}
          <button
            onClick={() => navigate('/agent-demo')}
            className="h-7 px-2.5 flex items-center gap-1.5 text-xs font-semibold text-[#002970] bg-[#EBF9FE] hover:bg-[#D5F3FD] border border-[#B2E9FC] rounded-md transition-all shadow-2xs group"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00BAF2] group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline font-bold">AI Teammate Demo</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16845B] animate-pulse" />
          </button>

          {/* Environment Tag */}
          <span className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium text-[#667085] bg-[#F8F9FC] border border-[#E4EAF2]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16845B]" />
            Field Operations
          </span>

          {/* Reset Demo Data */}
          <button
            onClick={handleReset}
            title="Reset demo data to initial state"
            className="h-7 px-2 flex items-center gap-1.5 text-xs text-[#667085] hover:text-[#172B4D] hover:bg-[#F5F8FC] border border-[#E4EAF2] rounded transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-[#667085]" />
            <span className="hidden md:inline text-[11px] font-medium">Reset Demo</span>
          </button>

          {/* Notifications button */}
          <button
            className="relative w-7 h-7 flex items-center justify-center text-[#667085] hover:text-[#172B4D] hover:bg-[#F5F8FC] rounded transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#00BAF2]" aria-label="Unread updates" />
          </button>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-1.5 h-7 pl-1.5 pr-2 rounded hover:bg-[#F5F8FC] transition-colors border border-transparent hover:border-[#E4EAF2]"
              aria-expanded={showProfile}
              aria-haspopup="menu"
            >
              <div className="w-5.5 h-5.5 rounded bg-[#002970] flex items-center justify-center text-white text-[10px] font-bold">
                AS
              </div>
              <span className="text-xs font-medium text-[#172B4D] hidden md:inline">Arjun S.</span>
              <ChevronDown className="w-3 h-3 text-[#667085]" />
            </button>
            {showProfile && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#E4EAF2] rounded-md shadow-md z-50 py-1" role="menu">
                <div className="px-3 py-2 border-b border-[#E4EAF2] bg-[#FAFCFE]">
                  <p className="text-xs font-semibold text-[#172B4D]">Arjun Sharma</p>
                  <p className="text-[11px] text-[#667085]">Field Sales Executive</p>
                  <p className="text-[10px] text-[#002970] font-medium mt-0.5">Bengaluru Central Territory</p>
                </div>
                <button
                  onClick={() => { setShowAbout(true); setShowProfile(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-[#172B4D] hover:bg-[#F5F8FC] flex items-center gap-2"
                  role="menuitem"
                >
                  <Info className="w-3.5 h-3.5 text-[#00BAF2]" />
                  About NEXA
                </button>
                <button
                  onClick={() => { handleReset(); setShowProfile(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-[#D92D20] hover:bg-[#FEF3F2] flex items-center gap-2"
                  role="menuitem"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Prototype Data
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* About NEXA Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg border border-[#E4EAF2] shadow-lg max-w-md w-full p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-[#002970] flex items-center justify-center text-white">
                  <svg viewBox="0 0 28 28" className="w-5 h-5" fill="none">
                    <path d="M6 21V7l8 14h8V7h-4v14L10 7H6z" fill="#00BAF2" />
                    <circle cx="21" cy="7" r="2.5" fill="#FFFFFF" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#002970]">NEXA — Paytm Field Sales Platform</h3>
                  <p className="text-xs text-[#667085]">Merchant Onboarding Co-Pilot</p>
                </div>
              </div>
              <button onClick={() => setShowAbout(false)} className="text-[#667085] hover:text-[#172B4D]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#344054] leading-relaxed">
              NEXA is an AI-powered field sales co-pilot designed for Paytm Field Sales Executives (FSEs). It streamlines merchant profiling, document extraction, payment-device matching, and onboarding readiness.
            </p>
            <div className="rounded bg-[#F8F9FC] border border-[#E4EAF2] p-3 text-[11px] text-[#667085] space-y-1">
              <p><strong className="text-[#172B4D]">Context:</strong> Paytm Hackathon Submission Prototype</p>
              <p><strong className="text-[#172B4D]">Mode:</strong> Demo seed data with explainable recommendation rules</p>
              <p><strong className="text-[#172B4D]">Notice:</strong> Simulated field operations interface; not connected to live banking APIs.</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowAbout(false)}
                className="px-3.5 py-1.5 text-xs font-medium bg-[#002970] text-white rounded hover:bg-[#001f56]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
