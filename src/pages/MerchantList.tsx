import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, ArrowUpDown, Store, Phone, MapPin, ArrowRight } from 'lucide-react';
import { getMerchants } from '@/lib/store';
import type { MerchantStatus, BusinessType, Merchant } from '@/types';
import { MerchantStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CompletenessBar, EmptyState, DemoNotice } from '@/components/ui/shared';
import { timeAgo } from '@/lib/utils';

const BUSINESS_TYPES = [
  { value: '', label: 'All Categories' },
  { value: 'retail', label: 'Retail' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'grocery', label: 'Grocery' },
  { value: 'medical', label: 'Medical' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'salon', label: 'Salon' },
  { value: 'service', label: 'Service' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'needs_review', label: 'Needs Review' },
  { value: 'incomplete', label: 'Incomplete' },
  { value: 'ready_for_submission', label: 'Ready' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'extraction_failed', label: 'Failed' },
];

type SortKey = 'businessName' | 'updatedAt' | 'completeness' | 'status';
type SortDir = 'asc' | 'desc';

export function MerchantList() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const allMerchants = getMerchants();

  const filtered = allMerchants
    .filter(m => {
      const q = query.toLowerCase();
      if (q && !m.businessName.toLowerCase().includes(q) && !m.phone.includes(q) && !m.ownerName.toLowerCase().includes(q) && !m.address.city.toLowerCase().includes(q)) return false;
      if (statusFilter && m.status !== statusFilter) return false;
      if (typeFilter && m.businessType !== typeFilter) return false;
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'businessName') cmp = a.businessName.localeCompare(b.businessName);
      else if (sortKey === 'updatedAt') cmp = a.updatedAt.localeCompare(b.updatedAt);
      else if (sortKey === 'completeness') cmp = a.completeness - b.completeness;
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-[#002970] tracking-tight">Merchant Directory</h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Territory directory of active merchant leads, onboarding profiles, and deployed hardware.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => navigate('/new-merchant')}
        >
          New Merchant
        </Button>
      </div>

      <DemoNotice>
        Directory displays simulated merchant profiles in the Bengaluru field territory.
      </DemoNotice>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E4EAF2] rounded-lg p-3 shadow-xs flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#98A2B3]" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by store name, proprietor, mobile, or city…"
            className="w-full h-8 pl-8 pr-3 text-xs border border-[#E4EAF2] rounded bg-[#F8F9FC] text-[#172B4D] placeholder:text-[#98A2B3] focus:outline-none focus:ring-1.5 focus:ring-[#00BAF2] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 text-xs border border-[#E4EAF2] rounded bg-white text-[#172B4D] focus:outline-none focus:ring-1.5 focus:ring-[#00BAF2]"
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="h-8 px-2.5 text-xs border border-[#E4EAF2] rounded bg-white text-[#172B4D] focus:outline-none focus:ring-1.5 focus:ring-[#00BAF2]"
          >
            {BUSINESS_TYPES.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {(query || statusFilter || typeFilter) && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => { setQuery(''); setStatusFilter(''); setTypeFilter(''); }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-[#E4EAF2] rounded-lg shadow-xs overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#E4EAF2] bg-[#FAFCFE] flex items-center justify-between">
          <p className="text-xs font-semibold text-[#172B4D]">
            Showing {filtered.length} of {allMerchants.length} Merchants
          </p>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Store className="w-6 h-6 text-[#98A2B3]" />}
            title="No merchants match your filter criteria"
            description="Try clearing search query or adjusting business category filter."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setQuery(''); setStatusFilter(''); setTypeFilter(''); }}
              >
                Clear Filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs" aria-label="Merchants directory table">
              <thead>
                <tr className="border-b border-[#E4EAF2] bg-[#F8F9FC] text-[#667085]">
                  <th
                    className="text-left px-4 py-2.5 font-medium cursor-pointer hover:text-[#172B4D]"
                    onClick={() => toggleSort('businessName')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Merchant / Store</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium">Contact</th>
                  <th className="text-left px-4 py-2.5 font-medium">Category</th>
                  <th
                    className="text-left px-4 py-2.5 font-medium cursor-pointer hover:text-[#172B4D]"
                    onClick={() => toggleSort('completeness')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Profile</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-2.5 font-medium cursor-pointer hover:text-[#172B4D]"
                    onClick={() => toggleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-2.5 font-medium cursor-pointer hover:text-[#172B4D]"
                    onClick={() => toggleSort('updatedAt')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Updated</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4EAF2]">
                {filtered.map(m => (
                  <tr key={m.id} className="hover:bg-[#F8F9FC] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#172B4D]">{m.businessName}</p>
                      <p className="text-[10px] text-[#667085] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-[#98A2B3]" />
                        {m.address.city}, {m.address.state}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[#172B4D] font-medium">{m.ownerName}</p>
                      <p className="text-[10px] text-[#667085]">{m.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-[#344054] capitalize bg-[#F2F4F7] px-1.5 py-0.5 rounded">
                        {m.businessType}
                      </span>
                    </td>
                    <td className="px-4 py-3 w-32">
                      <CompletenessBar value={m.completeness} />
                    </td>
                    <td className="px-4 py-3">
                      <MerchantStatusBadge status={m.status} />
                    </td>
                    <td className="px-4 py-3 text-[#667085] text-[11px]">
                      {timeAgo(m.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => navigate(`/merchants/${m.id}`)}
                        >
                          Dossier
                        </Button>
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => navigate(`/merchants/${m.id}/edit`)}
                        >
                          Onboard
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
