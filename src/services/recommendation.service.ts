import type { Merchant, Recommendation, DeviceProduct, RecommendedSetup } from '@/types';

// ─── Sample device catalogue ──────────────────────────────────────────────
// All prices are ILLUSTRATIVE ONLY. Not official Paytm pricing.
export const SAMPLE_CATALOGUE: DeviceProduct[] = [
  {
    id: 'dev-001',
    name: 'Paytm QR Stand',
    type: 'qr_stand',
    price: 499,
    description: 'Printed QR code stand for UPI payments. No electricity required.',
    features: ['All UPI apps supported', 'Instant payment alerts via SMS', 'No setup fees', 'Replaceable QR'],
    isIllustrative: true,
  },
  {
    id: 'dev-002',
    name: 'Paytm Soundbox',
    type: 'soundbox',
    price: 1499,
    description: 'Voice-enabled payment confirmation device. Announces payment received.',
    features: ['Loud audio confirmation', 'Multilingual support', 'Battery + power mode', 'Real-time alerts'],
    isIllustrative: true,
  },
  {
    id: 'dev-003',
    name: 'Paytm POS Lite',
    type: 'pos_lite',
    price: 2499,
    description: 'Compact card + UPI terminal for moderate transaction volumes.',
    features: ['Debit & credit cards', 'UPI QR built-in', 'Thermal receipt printer', 'EMI support'],
    isIllustrative: true,
  },
  {
    id: 'dev-004',
    name: 'Paytm POS Pro',
    type: 'pos_pro',
    price: 4999,
    description: 'Full-featured POS terminal for high-volume merchants.',
    features: ['All card types', 'UPI + NFC', 'Inventory management', 'Daily settlement reports', 'Multi-user'],
    isIllustrative: true,
  },
];

const QR = SAMPLE_CATALOGUE[0];
const SB = SAMPLE_CATALOGUE[1];
const LITE = SAMPLE_CATALOGUE[2];
const PRO = SAMPLE_CATALOGUE[3];

function makeSetup(devices: DeviceProduct[], label: string, desc: string): RecommendedSetup {
  return {
    devices,
    totalPrice: devices.reduce((s, d) => s + d.price, 0),
    label,
    description: desc,
  };
}

// ─── Deterministic recommendation rules ───────────────────────────────────
// Rules are local demo logic only. Backend can replace via service interface.

export function generateRecommendation(merchant: Merchant): Recommendation {
  const {
    id,
    businessType,
    needsAudibleConfirmation,
    estimatedMonthlyVolume,
    estimatedTransactionsPerDay,
    paymentNeeds,
    budget,
  } = merchant;

  const factors: Record<string, string | number | boolean> = {
    businessType,
    needsAudible: needsAudibleConfirmation,
    monthlyVolume: estimatedMonthlyVolume ?? 'unknown',
    txPerDay: estimatedTransactionsPerDay ?? 'unknown',
    budget: budget ?? 'not_specified',
  };

  const missingInfo: string[] = [];
  const assumptions: string[] = [];

  if (!estimatedMonthlyVolume) missingInfo.push('Estimated monthly transaction volume not provided');
  if (!estimatedTransactionsPerDay) missingInfo.push('Estimated transactions per day not provided');
  if (!budget) missingInfo.push('Budget preference not specified');

  const highVolume = (estimatedMonthlyVolume ?? 0) > 300000 || (estimatedTransactionsPerDay ?? 0) > 50;
  const needsCard = paymentNeeds.includes('card_payments') || paymentNeeds.includes('pos_terminal');

  let primary: RecommendedSetup;
  let alternative: RecommendedSetup | undefined;
  const reasons: string[] = [];

  if (highVolume && needsCard) {
    // High volume + card needed → POS Pro + Soundbox if audible, else POS Pro + QR
    if (needsAudibleConfirmation) {
      primary = makeSetup([QR, SB, PRO], 'QR Stand + Soundbox + POS Pro', 'Full-featured setup for high-volume merchants requiring audio confirmation and card acceptance.');
      reasons.push('High transaction volume justifies POS Pro');
      reasons.push('Soundbox requested for audible payment confirmation');
      reasons.push('QR Stand adds low-cost UPI fallback channel');
    } else {
      primary = makeSetup([QR, PRO], 'QR Stand + POS Pro', 'Full card + UPI coverage for high-volume merchant.');
      reasons.push('High transaction volume justifies POS Pro terminal');
      reasons.push('QR Stand adds no-cost UPI channel');
    }
    alternative = makeSetup([QR, SB, LITE], 'QR Stand + Soundbox + POS Lite', 'Budget-friendly alternative with reduced card capabilities.');
  } else if (needsCard && !highVolume) {
    primary = makeSetup([QR, LITE], 'QR Stand + POS Lite', 'Balanced card + UPI setup for moderate transaction volumes.');
    reasons.push('Card payments requested — POS Lite covers debit/credit');
    reasons.push('QR Stand handles UPI at minimal cost');
    if (needsAudibleConfirmation) {
      alternative = makeSetup([QR, SB, LITE], 'QR Stand + Soundbox + POS Lite', 'Add Soundbox for audio confirmation.');
      assumptions.push('Soundbox added to alternative as audible confirmation is preferred');
    } else {
      alternative = makeSetup([QR], 'QR Stand only', 'Entry-level setup if card acceptance is not critical.');
    }
  } else if (needsAudibleConfirmation) {
    primary = makeSetup([QR, SB], 'QR Stand + Soundbox', 'UPI payments with audio confirmation. Ideal for busy counters.');
    reasons.push('Soundbox requested for audible payment confirmation');
    reasons.push('QR Stand covers all UPI apps');
    alternative = makeSetup([QR], 'QR Stand only', 'If budget is very tight, Soundbox can be added later.');

    if (businessType === 'restaurant' || businessType === 'grocery') {
      reasons.push(`${businessType} businesses typically benefit from audio alerts during rush hours`);
    }
  } else {
    // Default: QR only
    primary = makeSetup([QR], 'QR Stand', 'Entry-level UPI-only setup. Cost-effective for low-volume merchants.');
    reasons.push('UPI-only setup covers most payment needs at minimal cost');
    alternative = makeSetup([QR, SB], 'QR Stand + Soundbox', 'Add Soundbox for audio payment confirmation.');
    assumptions.push('Card payments not requested — if needed, upgrade to POS terminal');
  }

  // Budget gate
  if (budget === 'under_1000' && primary.totalPrice > 1000) {
    assumptions.push(`Primary recommendation (₹${primary.totalPrice}) exceeds stated budget. Consider alternative setup.`);
  }

  return {
    merchantId: id,
    recommendedSetup: primary,
    alternativeSetup: alternative,
    reasons,
    factors,
    missingInfo,
    assumptions,
    rulesetVersion: 'demo-v1.0',
    generatedAt: new Date().toISOString(),
    isIllustrative: true,
  };
}
