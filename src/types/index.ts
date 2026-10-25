// ─── Core Domain Types ─────────────────────────────────────────────────────

export type MerchantStatus =
  | 'new'
  | 'extracting'
  | 'needs_review'
  | 'incomplete'
  | 'ready_for_submission'
  | 'submitted'
  | 'extraction_failed';

export type BusinessType =
  | 'retail'
  | 'restaurant'
  | 'grocery'
  | 'medical'
  | 'clothing'
  | 'electronics'
  | 'salon'
  | 'service'
  | 'transport'
  | 'other';

export interface Merchant {
  id: string;
  businessName: string;
  businessType: BusinessType;
  ownerName: string;
  phone: string;
  email?: string;
  address: Address;
  gstin?: string;
  status: MerchantStatus;
  completeness: number; // 0-100
  paymentNeeds: PaymentNeed[];
  estimatedMonthlyVolume?: number;
  estimatedTransactionsPerDay?: number;
  needsAudibleConfirmation: boolean;
  budget?: DeviceBudget;
  createdAt: string; // ISO string
  updatedAt: string;
  assignedExecutiveId?: string;
  notes?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export type PaymentNeed =
  | 'qr_payments'
  | 'card_payments'
  | 'soundbox'
  | 'pos_terminal'
  | 'bulk_billing';

export type DeviceBudget = 'under_1000' | '1000_3000' | '3000_5000' | 'above_5000';

// ─── Document & Extraction ─────────────────────────────────────────────────

export type ExtractionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'not_started';

export type FieldStatus =
  | 'extracted'
  | 'needs_review'
  | 'user_confirmed'
  | 'missing'
  | 'invalid';

export interface ExtractedField {
  value: string;
  evidence?: string;
  status: FieldStatus;
  confidence?: number; // 0-1, only when provided by the service
}

export interface MerchantDocument {
  id: string;
  merchantId: string;
  fileName: string;
  mimeType: string;
  size: number; // bytes
  previewUrl?: string; // object URL or data URL
  extractionStatus: ExtractionStatus;
  extractedFields: Record<string, ExtractedField>;
  createdAt: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export type IssueCode =
  | 'required'
  | 'invalid_format'
  | 'conflicting_value'
  | 'awaiting_confirmation'
  | 'too_short'
  | 'too_long';

export type IssueStatus = 'open' | 'resolved' | 'acknowledged';

export interface ValidationIssue {
  fieldName: string;
  issueCode: IssueCode;
  message: string;
  status: IssueStatus;
}

// ─── Recommendations ─────────────────────────────────────────────────────────

export type DeviceType = 'qr_stand' | 'soundbox' | 'pos_lite' | 'pos_pro';

export interface DeviceProduct {
  id: string;
  name: string;
  type: DeviceType;
  price: number;
  description: string;
  features: string[];
  isIllustrative: true; // always true — sample catalogue, not official pricing
}

export interface RecommendedSetup {
  devices: DeviceProduct[];
  totalPrice: number;
  label: string;
  description: string;
}

export interface Recommendation {
  merchantId: string;
  recommendedSetup: RecommendedSetup;
  alternativeSetup?: RecommendedSetup;
  reasons: string[];
  factors: Record<string, string | number | boolean>;
  missingInfo: string[];
  assumptions: string[];
  rulesetVersion: string;
  generatedAt: string;
  isIllustrative: true; // always true
}

// ─── Application ─────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | 'draft'
  | 'ready_for_review'
  | 'submitted_simulated'
  | 'rejected';

export interface ReadinessCheck {
  key: string;
  label: string;
  passed: boolean;
  message?: string;
}

export interface ApplicationFormData {
  businessName: string;
  ownerName: string;
  businessType: BusinessType;
  phone: string;
  email?: string;
  gstin?: string;
  address: Address;
  deviceSetup?: string; // label of chosen setup
  deviceProductIds?: string[];
  notes?: string;
}

export interface MerchantApplication {
  id: string;
  merchantId: string;
  status: ApplicationStatus;
  formData: ApplicationFormData;
  readinessChecks: ReadinessCheck[];
  recommendation?: Recommendation;
  updatedAt: string;
  createdAt: string;
}

// ─── Follow-ups & Visits ─────────────────────────────────────────────────────

export type VisitStatus = 'scheduled' | 'completed' | 'missed' | 'cancelled';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MerchantVisit {
  id: string;
  merchantId: string;
  merchantName: string;
  address: string;
  scheduledAt: string;
  status: VisitStatus;
  coordinates?: Coordinates;
  reason?: string;
  notes?: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  totalMerchants: number;
  needsReview: number;
  readyForSubmission: number;
  followUpsDue: number;
  submittedThisMonth: number;
}

export interface ActivityEntry {
  merchantId: string;
  merchantName: string;
  action: string;
  timestamp: string;
  status: MerchantStatus;
}

// ─── API Layer ────────────────────────────────────────────────────────────────

export type AppMode = 'demo' | 'api';

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

export interface ApiResponse<T> {
  data: T;
  ok: true;
}

export interface ApiFailure {
  ok: false;
  error: ApiError;
}

export type ApiResult<T> = ApiResponse<T> | ApiFailure;
