import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Phone, MapPin, CreditCard, FileText, CheckCircle2 } from 'lucide-react';
import { Input, Select, Textarea, Checkbox } from '@/components/ui/FormFields';
import { Button } from '@/components/ui/Button';
import { AlertBanner } from '@/components/ui/shared';
import { validateMerchant } from '@/services/validation.service';
import { createMerchant, updateMerchant } from '@/lib/store';
import type { Merchant, BusinessType, PaymentNeed, DeviceBudget } from '@/types';

const BUSINESS_TYPE_OPTIONS = [
  { value: 'retail', label: 'Retail Store' },
  { value: 'restaurant', label: 'Restaurant / Eatery' },
  { value: 'grocery', label: 'Grocery / Kirana' },
  { value: 'medical', label: 'Pharmacy / Healthcare' },
  { value: 'clothing', label: 'Apparel & Footwear' },
  { value: 'electronics', label: 'Electronics & Repairs' },
  { value: 'salon', label: 'Salon & Wellness' },
  { value: 'service', label: 'General Services' },
  { value: 'transport', label: 'Logistics & Auto' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_NEED_OPTIONS: { value: PaymentNeed; label: string; desc: string }[] = [
  { value: 'qr_payments', label: 'UPI / QR Payments', desc: 'Accept payments from any UPI app' },
  { value: 'card_payments', label: 'Card Payments (Debit/Credit)', desc: 'Tap and chip transactions' },
  { value: 'soundbox', label: 'Voice Audio Confirmation', desc: 'Instant multilingual audio alert' },
  { value: 'pos_terminal', label: 'Smart POS Device', desc: 'Billing, cards, and UPI on one terminal' },
  { value: 'bulk_billing', label: 'Itemized Billing', desc: 'Inventory and multiple item carts' },
];

const BUDGET_OPTIONS = [
  { value: 'under_1000', label: 'Economy (< ₹1,000)' },
  { value: '1000_3000', label: 'Standard (₹1,000 – ₹3,000)' },
  { value: '3000_5000', label: 'Premium (₹3,000 – ₹5,000)' },
  { value: 'above_5000', label: 'Enterprise (> ₹5,000)' },
];

const VOLUME_OPTIONS = [
  { value: '', label: 'Select volume range…' },
  { value: '10000', label: 'Under ₹10,000 / month' },
  { value: '50000', label: '₹10,000 – ₹50,000 / month' },
  { value: '150000', label: '₹50,000 – ₹1.5L / month' },
  { value: '300000', label: '₹1.5L – ₹3L / month' },
  { value: '600000', label: '₹3L – ₹6L / month' },
  { value: '1000000', label: 'Above ₹6L / month' },
];

const TX_PER_DAY_OPTIONS = [
  { value: '', label: 'Select daily transactions…' },
  { value: '5', label: 'Under 10 tx / day' },
  { value: '20', label: '10 – 30 tx / day' },
  { value: '50', label: '30 – 70 tx / day' },
  { value: '100', label: '70 – 150 tx / day' },
  { value: '200', label: 'Above 150 tx / day' },
];

interface MerchantDetailsFormProps {
  merchant?: Merchant;
  onSaved: (merchant: Merchant) => void;
  onCancel?: () => void;
}

export function MerchantDetailsForm({ merchant, onSaved, onCancel }: MerchantDetailsFormProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    businessName: merchant?.businessName ?? '',
    ownerName: merchant?.ownerName ?? '',
    businessType: merchant?.businessType ?? '' as BusinessType | '',
    phone: merchant?.phone ?? '',
    email: merchant?.email ?? '',
    gstin: merchant?.gstin ?? '',
    line1: merchant?.address?.line1 ?? '',
    line2: merchant?.address?.line2 ?? '',
    city: merchant?.address?.city ?? '',
    state: merchant?.address?.state ?? '',
    pincode: merchant?.address?.pincode ?? '',
    paymentNeeds: merchant?.paymentNeeds ?? ['qr_payments', 'soundbox'] as PaymentNeed[],
    needsAudibleConfirmation: merchant?.needsAudibleConfirmation ?? true,
    estimatedMonthlyVolume: merchant?.estimatedMonthlyVolume?.toString() ?? '',
    estimatedTransactionsPerDay: merchant?.estimatedTransactionsPerDay?.toString() ?? '',
    budget: merchant?.budget ?? '' as DeviceBudget | '',
    notes: merchant?.notes ?? '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const togglePaymentNeed = (need: PaymentNeed) => {
    setForm(f => ({
      ...f,
      paymentNeeds: f.paymentNeeds.includes(need)
        ? f.paymentNeeds.filter(n => n !== need)
        : [...f.paymentNeeds, need],
    }));
  };

  const validate = () => {
    const partial = {
      businessName: form.businessName,
      ownerName: form.ownerName,
      phone: form.phone,
      businessType: form.businessType as BusinessType,
      address: {
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      },
      gstin: form.gstin || undefined,
      email: form.email || undefined,
    };

    const issues = validateMerchant(partial);
    if (issues.length > 0) {
      const errs: Record<string, string> = {};
      issues.forEach(i => { errs[i.fieldName] = i.message; });
      setFieldErrors(errs);
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 200));

    const partial = {
      businessName: form.businessName || 'Untitled Merchant',
      ownerName: form.ownerName,
      phone: form.phone,
      businessType: (form.businessType || 'other') as BusinessType,
      address: {
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      },
      gstin: form.gstin || undefined,
      email: form.email || undefined,
      paymentNeeds: form.paymentNeeds,
      needsAudibleConfirmation: form.needsAudibleConfirmation,
      estimatedMonthlyVolume: form.estimatedMonthlyVolume ? parseInt(form.estimatedMonthlyVolume) : undefined,
      estimatedTransactionsPerDay: form.estimatedTransactionsPerDay ? parseInt(form.estimatedTransactionsPerDay) : undefined,
      budget: (form.budget as DeviceBudget) || undefined,
      notes: form.notes || undefined,
    };

    let saved: Merchant;
    if (merchant) {
      saved = updateMerchant(merchant.id, { ...partial, status: 'incomplete' })!;
    } else {
      saved = createMerchant({ ...partial, assignedExecutiveId: 'exec-001' });
    }
    setSaving(false);
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2500);
  };

  const handleContinue = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 250));

    const partial = {
      businessName: form.businessName,
      ownerName: form.ownerName,
      phone: form.phone,
      businessType: form.businessType as BusinessType,
      address: {
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      },
      gstin: form.gstin || undefined,
      email: form.email || undefined,
      paymentNeeds: form.paymentNeeds,
      needsAudibleConfirmation: form.needsAudibleConfirmation,
      estimatedMonthlyVolume: form.estimatedMonthlyVolume ? parseInt(form.estimatedMonthlyVolume) : undefined,
      estimatedTransactionsPerDay: form.estimatedTransactionsPerDay ? parseInt(form.estimatedTransactionsPerDay) : undefined,
      budget: (form.budget as DeviceBudget) || undefined,
      notes: form.notes || undefined,
    };

    let saved: Merchant;
    if (merchant) {
      saved = updateMerchant(merchant.id, { ...partial, status: merchant.status === 'new' ? 'incomplete' : merchant.status })!;
    } else {
      saved = createMerchant({ ...partial, assignedExecutiveId: 'exec-001' });
    }
    setSaving(false);
    onSaved(saved);
  };

  const err = (f: string) => fieldErrors[f];

  return (
    <div className="space-y-4">
      {draftSaved && (
        <AlertBanner variant="success" icon={<CheckCircle2 className="w-4 h-4 text-[#16845B]" />}>
          Merchant draft saved successfully. You can resume editing anytime.
        </AlertBanner>
      )}

      {/* 1. Business Information */}
      <div className="bg-white border border-[#E4EAF2] rounded-lg p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E4EAF2]">
          <Building2 className="w-4 h-4 text-[#002970]" />
          <h2 className="text-xs font-semibold text-[#172B4D] uppercase tracking-wide">
            1. Business Information
          </h2>
          <span className="text-[10px] text-[#667085] ml-auto">Required fields *</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Business Trading Name"
            required
            value={form.businessName}
            onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
            error={err('businessName')}
            placeholder="e.g. Sri Balaji Supermarket"
          />
          <Input
            label="Proprietor / Owner Name"
            required
            value={form.ownerName}
            onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))}
            error={err('ownerName')}
            placeholder="Full legal name as per PAN"
          />
          <Select
            label="Business Category / Type"
            required
            value={form.businessType}
            onChange={e => setForm(f => ({ ...f, businessType: e.target.value as BusinessType }))}
            options={BUSINESS_TYPE_OPTIONS}
            placeholder="Select business category…"
            error={err('businessType')}
          />
          <Input
            label="GSTIN (Goods and Services Tax ID)"
            value={form.gstin}
            onChange={e => setForm(f => ({ ...f, gstin: e.target.value.toUpperCase() }))}
            error={err('gstin')}
            placeholder="e.g. 29ABCDE1234F1Z5"
            hint="Optional for micro-merchants · 15 alphanumeric characters"
            maxLength={15}
          />
        </div>
      </div>

      {/* 2. Contact Details */}
      <div className="bg-white border border-[#E4EAF2] rounded-lg p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E4EAF2]">
          <Phone className="w-4 h-4 text-[#002970]" />
          <h2 className="text-xs font-semibold text-[#172B4D] uppercase tracking-wide">
            2. Contact Details
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Primary Contact Mobile Number"
            required
            type="tel"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            error={err('phone')}
            placeholder="10-digit mobile number"
            maxLength={10}
            hint="Used for OTP verification and Soundbox pairing"
          />
          <Input
            label="Email Address"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            error={err('email')}
            placeholder="merchant@example.com (optional)"
            hint="Monthly settlement statements will be sent here"
          />
        </div>
      </div>

      {/* 3. Business Address */}
      <div className="bg-white border border-[#E4EAF2] rounded-lg p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E4EAF2]">
          <MapPin className="w-4 h-4 text-[#002970]" />
          <h2 className="text-xs font-semibold text-[#172B4D] uppercase tracking-wide">
            3. Physical Store Address
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Input
            label="Shop / Building & Street Address"
            required
            value={form.line1}
            onChange={e => setForm(f => ({ ...f, line1: e.target.value }))}
            error={err('address.line1')}
            placeholder="Shop #, Building name, Cross street"
          />
          <Input
            label="Locality / Landmark"
            value={form.line2}
            onChange={e => setForm(f => ({ ...f, line2: e.target.value }))}
            placeholder="Opposite bus stand, Near main market (optional)"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="City / Town"
              required
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              error={err('address.city')}
              placeholder="e.g. Bengaluru"
            />
            <Input
              label="State"
              required
              value={form.state}
              onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
              error={err('address.state')}
              placeholder="e.g. Karnataka"
            />
            <Input
              label="PIN Code"
              required
              value={form.pincode}
              onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))}
              error={err('address.pincode')}
              maxLength={6}
              placeholder="6-digit postal code"
            />
          </div>
        </div>
      </div>

      {/* 4. Payment & Hardware Requirements */}
      <div className="bg-white border border-[#E4EAF2] rounded-lg p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#E4EAF2]">
          <CreditCard className="w-4 h-4 text-[#002970]" />
          <div>
            <h2 className="text-xs font-semibold text-[#172B4D] uppercase tracking-wide">
              4. Payment Acceptance & Hardware Needs
            </h2>
            <p className="text-[10px] text-[#667085]">Informs NEXA device recommendations in Step 4</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PAYMENT_NEED_OPTIONS.map(opt => (
              <label
                key={opt.value}
                className={`flex items-start gap-2.5 p-2.5 rounded border transition-colors cursor-pointer ${
                  form.paymentNeeds.includes(opt.value)
                    ? 'border-[#00BAF2] bg-[#EBF9FE]/50'
                    : 'border-[#E4EAF2] hover:bg-[#F8F9FC]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.paymentNeeds.includes(opt.value)}
                  onChange={() => togglePaymentNeed(opt.value)}
                  className="mt-0.5 w-4 h-4 rounded border-[#D0D5DD] text-[#00BAF2] focus:ring-[#00BAF2]"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#172B4D]">{opt.label}</p>
                  <p className="text-[10px] text-[#667085]">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="p-3 bg-[#F8F9FC] border border-[#E4EAF2] rounded-md">
            <Checkbox
              id="audible-confirm"
              label="Audible Payment Alerts (Paytm Soundbox)"
              description="Merchant operates in a noisy/busy counter and needs instant spoken payment confirmation"
              checked={form.needsAudibleConfirmation}
              onChange={v => setForm(f => ({ ...f, needsAudibleConfirmation: v }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <Select
              label="Est. Monthly Volume"
              value={form.estimatedMonthlyVolume}
              onChange={e => setForm(f => ({ ...f, estimatedMonthlyVolume: e.target.value }))}
              options={VOLUME_OPTIONS}
              placeholder=""
            />
            <Select
              label="Est. Daily Transactions"
              value={form.estimatedTransactionsPerDay}
              onChange={e => setForm(f => ({ ...f, estimatedTransactionsPerDay: e.target.value }))}
              options={TX_PER_DAY_OPTIONS}
              placeholder=""
            />
            <Select
              label="Hardware Budget Preference"
              value={form.budget}
              onChange={e => setForm(f => ({ ...f, budget: e.target.value as DeviceBudget }))}
              options={BUDGET_OPTIONS}
              placeholder="Select budget tier…"
            />
          </div>
        </div>
      </div>

      {/* 5. Field Sales Notes */}
      <div className="bg-white border border-[#E4EAF2] rounded-lg p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#E4EAF2]">
          <FileText className="w-4 h-4 text-[#002970]" />
          <h2 className="text-xs font-semibold text-[#172B4D] uppercase tracking-wide">
            5. Executive Field Observations
          </h2>
        </div>
        <Textarea
          label="Internal Notes"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Counter location, footfall observations, language preference, or competitor devices present…"
          hint="Visible only to field sales operations · Not printed on merchant contracts"
        />
      </div>

      {/* Validation alert if errors */}
      {Object.keys(fieldErrors).length > 0 && (
        <AlertBanner variant="error" title="Required Fields Missing">
          Please correct the highlighted fields above before advancing to document extraction.
        </AlertBanner>
      )}

      {/* Docked Action Bar */}
      <div className="sticky bottom-16 z-10 bg-white border border-[#E4EAF2] rounded-lg p-3.5 flex items-center justify-between shadow-xs md:bottom-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (onCancel ? onCancel() : navigate('/merchants'))}
        >
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveDraft}
            loading={saving}
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleContinue}
            loading={saving}
          >
            Continue to Documents →
          </Button>
        </div>
      </div>
    </div>
  );
}
