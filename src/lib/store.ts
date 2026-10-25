import type {
  Merchant,
  MerchantDocument,
  MerchantApplication,
  MerchantVisit,
  Recommendation,
  ActivityEntry,
  DashboardMetrics,
} from '@/types';
import {
  DEMO_MERCHANTS,
  DEMO_DOCUMENTS,
  DEMO_APPLICATIONS,
  DEMO_VISITS,
  DEMO_RECOMMENDATIONS,
  DEMO_ACTIVITY,
  computeMetrics,
} from '@/data/demo/seed';

// ─── LocalStorage keys ─────────────────────────────────────────────────────
const KEYS = {
  merchants: 'sp_merchants',
  documents: 'sp_documents',
  applications: 'sp_applications',
  visits: 'sp_visits',
  recommendations: 'sp_recommendations',
  activity: 'sp_activity',
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Initialize seed data once ─────────────────────────────────────────────
export function initDemoStore(): void {
  if (!localStorage.getItem(KEYS.merchants)) {
    save(KEYS.merchants, DEMO_MERCHANTS);
  }
  if (!localStorage.getItem(KEYS.documents)) {
    save(KEYS.documents, DEMO_DOCUMENTS);
  }
  if (!localStorage.getItem(KEYS.applications)) {
    save(KEYS.applications, DEMO_APPLICATIONS);
  }
  if (!localStorage.getItem(KEYS.visits)) {
    save(KEYS.visits, DEMO_VISITS);
  }
  if (!localStorage.getItem(KEYS.recommendations)) {
    save(KEYS.recommendations, DEMO_RECOMMENDATIONS);
  }
  if (!localStorage.getItem(KEYS.activity)) {
    save(KEYS.activity, DEMO_ACTIVITY);
  }
}

export function resetDemoStore(): void {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  initDemoStore();
}

// ─── Merchants ─────────────────────────────────────────────────────────────
export function getMerchants(): Merchant[] {
  return load<Merchant[]>(KEYS.merchants, DEMO_MERCHANTS);
}

export function getMerchantById(id: string): Merchant | undefined {
  return getMerchants().find(m => m.id === id);
}

export function createMerchant(data: Omit<Merchant, 'id' | 'createdAt' | 'updatedAt' | 'completeness' | 'status'>): Merchant {
  const merchants = getMerchants();
  const now = new Date().toISOString();
  const merchant: Merchant = {
    ...data,
    id: generateId('m'),
    status: 'new',
    completeness: computeCompleteness(data),
    createdAt: now,
    updatedAt: now,
  };
  save(KEYS.merchants, [...merchants, merchant]);
  addActivity({ merchantId: merchant.id, merchantName: merchant.businessName, action: 'Merchant profile created', timestamp: now, status: 'new' });
  return merchant;
}

export function updateMerchant(id: string, updates: Partial<Merchant>): Merchant | undefined {
  const merchants = getMerchants();
  const idx = merchants.findIndex(m => m.id === id);
  if (idx === -1) return undefined;
  const updated: Merchant = { ...merchants[idx], ...updates, updatedAt: new Date().toISOString() };
  updated.completeness = computeCompleteness(updated);
  merchants[idx] = updated;
  save(KEYS.merchants, merchants);
  return updated;
}

function computeCompleteness(m: Partial<Merchant>): number {
  const checks = [
    Boolean(m.businessName),
    Boolean(m.ownerName),
    Boolean(m.phone),
    Boolean(m.businessType),
    Boolean(m.address?.line1),
    Boolean(m.address?.city),
    Boolean(m.address?.state),
    Boolean(m.address?.pincode),
    Boolean(m.gstin),
    Boolean(m.paymentNeeds && m.paymentNeeds.length > 0),
    Boolean(m.estimatedMonthlyVolume),
    Boolean(m.estimatedTransactionsPerDay),
  ];
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

// ─── Documents ─────────────────────────────────────────────────────────────
export function getDocuments(): MerchantDocument[] {
  return load<MerchantDocument[]>(KEYS.documents, DEMO_DOCUMENTS);
}

export function getDocumentsByMerchant(merchantId: string): MerchantDocument[] {
  return getDocuments().filter(d => d.merchantId === merchantId);
}

export function addDocument(doc: Omit<MerchantDocument, 'id' | 'createdAt'>): MerchantDocument {
  const docs = getDocuments();
  const newDoc: MerchantDocument = { ...doc, id: generateId('doc'), createdAt: new Date().toISOString() };
  save(KEYS.documents, [...docs, newDoc]);
  return newDoc;
}

export function updateDocument(id: string, updates: Partial<MerchantDocument>): MerchantDocument | undefined {
  const docs = getDocuments();
  const idx = docs.findIndex(d => d.id === id);
  if (idx === -1) return undefined;
  docs[idx] = { ...docs[idx], ...updates };
  save(KEYS.documents, docs);
  return docs[idx];
}

// ─── Applications ──────────────────────────────────────────────────────────
export function getApplications(): MerchantApplication[] {
  return load<MerchantApplication[]>(KEYS.applications, DEMO_APPLICATIONS);
}

export function getApplicationByMerchant(merchantId: string): MerchantApplication | undefined {
  return getApplications().find(a => a.merchantId === merchantId);
}

export function saveApplication(app: Omit<MerchantApplication, 'id' | 'createdAt' | 'updatedAt'>): MerchantApplication {
  const apps = getApplications();
  const existing = apps.find(a => a.merchantId === app.merchantId);
  const now = new Date().toISOString();
  if (existing) {
    const updated: MerchantApplication = { ...existing, ...app, updatedAt: now };
    const idx = apps.findIndex(a => a.id === existing.id);
    apps[idx] = updated;
    save(KEYS.applications, apps);
    return updated;
  }
  const newApp: MerchantApplication = { ...app, id: generateId('app'), createdAt: now, updatedAt: now };
  save(KEYS.applications, [...apps, newApp]);
  return newApp;
}

export function updateApplication(id: string, updates: Partial<MerchantApplication>): MerchantApplication | undefined {
  const apps = getApplications();
  const idx = apps.findIndex(a => a.id === id);
  if (idx === -1) return undefined;
  apps[idx] = { ...apps[idx], ...updates, updatedAt: new Date().toISOString() };
  save(KEYS.applications, apps);
  return apps[idx];
}

// ─── Recommendations ───────────────────────────────────────────────────────
export function getRecommendations(): Recommendation[] {
  return load<Recommendation[]>(KEYS.recommendations, DEMO_RECOMMENDATIONS);
}

export function getRecommendationByMerchant(merchantId: string): Recommendation | undefined {
  return getRecommendations().find(r => r.merchantId === merchantId);
}

export function saveRecommendation(rec: Recommendation): void {
  const recs = getRecommendations();
  const idx = recs.findIndex(r => r.merchantId === rec.merchantId);
  if (idx >= 0) {
    recs[idx] = rec;
  } else {
    recs.push(rec);
  }
  save(KEYS.recommendations, recs);
}

// ─── Visits ────────────────────────────────────────────────────────────────
export function getVisits(): MerchantVisit[] {
  return load<MerchantVisit[]>(KEYS.visits, DEMO_VISITS);
}

export function getUpcomingVisits(): MerchantVisit[] {
  const now = new Date().toISOString();
  return getVisits().filter(v => v.status === 'scheduled' && v.scheduledAt >= now).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}

export function createVisit(v: Omit<MerchantVisit, 'id'>): MerchantVisit {
  const visits = getVisits();
  const newVisit: MerchantVisit = { ...v, id: generateId('v') };
  save(KEYS.visits, [...visits, newVisit]);
  return newVisit;
}

export function updateVisit(id: string, updates: Partial<MerchantVisit>): MerchantVisit | undefined {
  const visits = getVisits();
  const idx = visits.findIndex(v => v.id === id);
  if (idx === -1) return undefined;
  visits[idx] = { ...visits[idx], ...updates };
  save(KEYS.visits, visits);
  return visits[idx];
}

// ─── Activity ──────────────────────────────────────────────────────────────
export function getActivity(): ActivityEntry[] {
  return load<ActivityEntry[]>(KEYS.activity, DEMO_ACTIVITY);
}

export function addActivity(entry: ActivityEntry): void {
  const activity = getActivity();
  save(KEYS.activity, [entry, ...activity].slice(0, 50)); // keep latest 50
}

// ─── Dashboard ─────────────────────────────────────────────────────────────
export function getDashboardMetrics(): DashboardMetrics {
  return computeMetrics(getMerchants());
}
