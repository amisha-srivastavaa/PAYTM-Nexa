import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, RotateCcw, Info, X, Moon, Sun, Wifi, WifiOff, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMerchants, resetDemoStore } from '@/lib/store';
import { Brand } from '@/components/ui/Brand';

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
  const [demoMode, setDemoMode] = useState(() => localStorage.getItem('nexa-demo-mode') === 'true');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('nexa-theme') === 'dark' ? 'dark' : 'light');
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('nexa-theme', theme);
  }, [theme]);

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  const toggleDemoMode = () => {
    if (demoMode) {
      localStorage.removeItem('nexa-demo-mode');
      setDemoMode(false);
      return;
    }
    resetDemoStore();
    localStorage.setItem('nexa-demo-mode', 'true');
    setDemoMode(true);
    navigate('/merchants/m-001/edit?demo=1');
  };

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
      <header className="min-h-14 flex-shrink-0 bg-white border-b border-[#D8ECF8] flex items-center px-3 sm:px-5 gap-3 z-20" role="banner">
        {/* Page Title Context */}
        <div className="flex items-center gap-3 min-w-0 md:min-w-[150px]">
          <span className="md:hidden"><Brand compact linked /></span>
          <span className="hidden md:inline text-sm font-display font-bold text-[#09254b] tracking-tight">{title}</span>
        </div>

        {/* Global Merchant Search with Paytm light-blue glow */}
        <div className="relative flex-1 max-w-sm hidden sm:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#00BAF2]" aria-hidden />
            <input
              type="search"
              placeholder="Search merchants by store, owner, mobile, or city…"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => query && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              className={cn(
                'w-full h-8 pl-8 pr-3 text-xs border border-[#D8ECF8] rounded bg-[#F2F8FD] text-[#172B4D] placeholder:text-[#8993A4]',
                'focus:outline-none focus:ring-2 focus:ring-[#00BAF2]/30 focus:border-[#00BAF2] focus:bg-white transition-all',
              )}
              aria-label="Search merchants"
              aria-autocomplete="list"
              aria-expanded={results.length > 0}
            />
          </div>
          {results.length > 0 && showDropdown !== false && (
            <div className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-[#D8ECF8] rounded-md shadow-paytm-md z-50 py-1" role="listbox">
              {results.map(r => (
                <button
                  key={r.id}
                  role="option"
                  className="w-full px-3 py-2 text-left hover:bg-[#F0F8FD] flex items-center justify-between transition-colors border-b border-[#EBF4FA] last:border-0"
                  onClick={() => handleSelect(r.id)}
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold text-[#002970] text-xs truncate">{r.businessName}</p>
                    <p className="text-[10px] text-[#5E6C84]">{r.city}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-[#007FA5] bg-[#E1F4FD] border border-[#BAE7F8] px-1.5 py-0.5 rounded capitalize flex-shrink-0">
                    {r.status.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D8ECF8] bg-[#F7FCFE] px-2 sm:px-2.5 min-h-9 text-[10px] font-semibold text-[#007FA5]" aria-live="polite">
            {online ? <Wifi className="h-3.5 w-3.5" aria-hidden="true" /> : <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />}
            <span>{online ? 'Offline-ready' : 'Offline mode'}</span>
            <span className={cn('h-2 w-2 rounded-full', online ? 'bg-emerald-500' : 'bg-amber-500')} aria-hidden="true" />
          </span>

          <button
            type="button"
            onClick={toggleDemoMode}
            aria-pressed={demoMode}
            aria-label={demoMode ? 'Turn demo mode off' : 'Turn demo mode on and load sample merchant'}
            className={cn('touch-target inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 text-[11px] font-bold', demoMode ? 'border-[#00BAF2] bg-[#E1F4FD] text-[#007FA5]' : 'border-[#D8ECF8] bg-white text-[#52677d] hover:bg-[#F7FCFE]')}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Demo mode</span>
            <span className="sm:hidden">Demo</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme(current => current === 'light' ? 'dark' : 'light')}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            className="touch-target inline-flex w-10 items-center justify-center rounded-full border border-[#D8ECF8] bg-white text-[#52677d] hover:bg-[#F7FCFE]"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={handleReset}
            title="Reset demo data to initial state"
            className="hidden md:flex h-9 px-2.5 items-center gap-1.5 text-xs text-[#007FA5] hover:text-[#002970] hover:bg-[#E1F4FD] border border-[#D8ECF8] bg-[#F7FCFE] rounded transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-[#00BAF2]" />
            <span className="hidden md:inline text-[11px] font-semibold">Reset Demo</span>
          </button>

          {/* Notifications button */}
          <button
            className="relative hidden sm:flex w-9 h-9 items-center justify-center text-[#5E6C84] hover:text-[#002970] hover:bg-[#E1F4FD] rounded transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-3.5 h-3.5 text-[#00BAF2]" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#00BAF2]" aria-label="Unread updates" />
          </button>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-1.5 h-7 pl-1.5 pr-2 rounded hover:bg-[#E1F4FD] transition-colors border border-transparent hover:border-[#D8ECF8]"
              aria-expanded={showProfile}
              aria-haspopup="menu"
            >
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#00BAF2] to-[#008ECC] flex items-center justify-center text-white text-[10px] font-bold shadow-2xs">
                AS
              </div>
              <span className="text-xs font-semibold text-[#002970] hidden md:inline">Arjun S.</span>
              <ChevronDown className="w-3 h-3 text-[#5E6C84]" />
            </button>
            {showProfile && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-[#D8ECF8] rounded-md shadow-paytm-md z-50 py-1" role="menu">
                <div className="px-3.5 py-2.5 border-b border-[#D8ECF8] bg-[#F7FCFE]">
                  <p className="text-xs font-bold text-[#002970]">Arjun Sharma</p>
                  <p className="text-[11px] text-[#5E6C84]">Paytm Field Sales Executive</p>
                  <p className="text-[10px] text-[#00BAF2] font-semibold mt-0.5">Bengaluru Central Territory</p>
                </div>
                <button
                  onClick={() => { setShowAbout(true); setShowProfile(false); }}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#172B4D] hover:bg-[#F0F8FD] flex items-center gap-2"
                  role="menuitem"
                >
                  <Info className="w-3.5 h-3.5 text-[#00BAF2]" />
                  About NEXA
                </button>
                <button
                  onClick={() => { handleReset(); setShowProfile(false); }}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#D92D20] hover:bg-[#FEF3F2] flex items-center gap-2"
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
          <div className="bg-white rounded-lg border border-[#D8ECF8] shadow-paytm-md max-w-md w-full p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00BAF2] to-[#008ECC] flex items-center justify-center text-white shadow-paytm">
                  <svg viewBox="0 0 28 28" className="w-5 h-5" fill="none">
                    <path d="M6 21V7l8 14h8V7h-4v14L10 7H6z" fill="#FFFFFF" />
                    <circle cx="21" cy="7" r="2.5" fill="#002970" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#002970]">NEXA — Paytm Field Sales Platform</h3>
                  <p className="text-xs text-[#007FA5]">Paytm Merchant Acquisition Co-Pilot</p>
                </div>
              </div>
              <button onClick={() => setShowAbout(false)} className="text-[#5E6C84] hover:text-[#002970]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#344054] leading-relaxed">
              NEXA is an AI-powered field sales co-pilot designed for Paytm Field Sales Executives (FSEs). It streamlines merchant profiling, document extraction, payment-device matching, and onboarding readiness.
            </p>
            <div className="rounded bg-[#F0F8FD] border border-[#BAE7F8] p-3 text-[11px] text-[#005B7A] space-y-1">
              <p><strong className="text-[#002970]">Context:</strong> Paytm Hackathon Submission Prototype</p>
              <p><strong className="text-[#002970]">Palette:</strong> Paytm Signature Light Blue (#00BAF2) & Deep Navy (#002970)</p>
              <p><strong className="text-[#002970]">Notice:</strong> Simulated field operations interface; not connected to live banking APIs.</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowAbout(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-[#00BAF2] text-white rounded hover:bg-[#00a4d6] shadow-xs"
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
