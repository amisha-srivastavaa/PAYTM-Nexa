import { useState } from 'react';
import { CheckCircle2, Edit3, AlertTriangle, X, Check, FileImage, ShieldCheck } from 'lucide-react';
import { FieldStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/FormFields';
import { AlertBanner, Card, CardHeader, CardBody } from '@/components/ui/shared';
import { cn } from '@/lib/utils';
import { updateDocument, updateMerchant } from '@/lib/store';
import type { MerchantDocument, ExtractedField, FieldStatus, Merchant } from '@/types';

interface ExtractionReviewProps {
  merchant: Merchant;
  document: MerchantDocument;
  onConfirmed: (doc: MerchantDocument) => void;
}

const FIELD_LABELS: Record<string, string> = {
  businessName: 'Business Name',
  ownerName: 'Proprietor Name',
  phone: 'Phone Number',
  address: 'Premises Address',
  gstin: 'GSTIN',
};

interface FieldRowProps {
  fieldKey: string;
  field: ExtractedField;
  onUpdate: (key: string, updates: Partial<ExtractedField>) => void;
}

function FieldRow({ fieldKey, field, onUpdate }: FieldRowProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(field.value);

  const handleConfirm = () => {
    onUpdate(fieldKey, { status: 'user_confirmed', value });
    setEditing(false);
  };

  const handleEdit = () => {
    setValue(field.value);
    setEditing(true);
  };

  const isMissing = field.status === 'missing' || !field.value;
  const needsReview = field.status === 'needs_review';

  return (
    <div className={cn(
      'p-3 border-b border-[#E4EAF2] last:border-0 transition-colors',
      needsReview ? 'bg-[#FFFAEB]/40' : 'bg-white',
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-xs font-semibold text-[#172B4D]">{FIELD_LABELS[fieldKey] ?? fieldKey}</span>
            <FieldStatusBadge status={field.status} />
            {field.confidence !== undefined && (
              <span className="text-[10px] text-[#667085] bg-[#F2F4F7] px-1.5 py-0.2 rounded font-mono">
                {Math.round(field.confidence * 100)}% confidence
              </span>
            )}
          </div>

          {editing ? (
            <div className="flex items-center gap-2 mt-1.5">
              <Input
                value={value}
                onChange={e => setValue(e.target.value)}
                className="text-xs h-7.5"
                autoFocus
                aria-label={`Edit ${FIELD_LABELS[fieldKey] ?? fieldKey}`}
                onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); if (e.key === 'Escape') setEditing(false); }}
              />
              <Button size="xs" variant="primary" onClick={handleConfirm}>Confirm</Button>
              <Button size="xs" variant="ghost" onClick={() => setEditing(false)}><X className="w-3.5 h-3.5" /></Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <p className={cn('text-xs font-medium', isMissing ? 'text-[#98A2B3] italic' : 'text-[#172B4D]')}>
                {field.value || 'Not detected in uploaded document'}
              </p>
              <button
                onClick={handleEdit}
                className="text-[#667085] hover:text-[#002970] p-1 rounded hover:bg-[#F5F8FC] transition-colors"
                title="Edit field value"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {field.evidence && (
            <p className="text-[10px] text-[#667085] mt-1 italic flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#00BAF2]" />
              Evidence: {field.evidence}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ExtractionReview({ merchant, document, onConfirmed }: ExtractionReviewProps) {
  const [docState, setDocState] = useState<MerchantDocument>(document);

  const fields = docState.extractedFields ?? {};
  const fieldKeys = ['businessName', 'ownerName', 'phone', 'address', 'gstin'];

  const handleFieldUpdate = (key: string, updates: Partial<ExtractedField>) => {
    const updated = {
      ...fields,
      [key]: {
        ...fields[key],
        ...updates,
      },
    };
    const newDoc = updateDocument(docState.id, { extractedFields: updated })!;
    setDocState(newDoc);
  };

  const handleConfirmAll = () => {
    // Sync confirmed values back to merchant record
    const updates: Partial<Merchant> = {};
    if (fields.businessName?.value) updates.businessName = fields.businessName.value;
    if (fields.ownerName?.value) updates.ownerName = fields.ownerName.value;
    if (fields.phone?.value) updates.phone = fields.phone.value;
    if (fields.gstin?.value) updates.gstin = fields.gstin.value;

    updateMerchant(merchant.id, updates);
    onConfirmed(docState);
  };

  const needsReviewCount = Object.values(fields).filter(f => f.status === 'needs_review').length;

  return (
    <div className="space-y-4">
      {needsReviewCount > 0 && (
        <AlertBanner variant="warning" title="Field Review Required" icon={<AlertTriangle className="w-4 h-4 text-[#B76E00]" />}>
          {needsReviewCount} field{needsReviewCount > 1 ? 's require' : ' requires'} verification. Verify the detected text against the document on the left before confirming.
        </AlertBanner>
      )}

      {/* Desktop Split-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Pane: Document Image & Metadata (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E4EAF2] rounded-lg p-3.5 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E4EAF2]">
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4 text-[#002970]" />
                <h3 className="text-xs font-semibold text-[#172B4D]">Source Document</h3>
              </div>
              <span className="text-[10px] text-[#16845B] font-medium bg-[#ECFDF3] px-1.5 py-0.5 rounded border border-[#A6F4C5]">
                OCR Processed
              </span>
            </div>

            <p className="text-[11px] text-[#667085] mb-2 truncate">File: {docState.fileName}</p>

            <div className="rounded border border-[#E4EAF2] bg-[#F8F9FC] p-2 flex items-center justify-center min-h-[220px]">
              {docState.previewUrl ? (
                <img src={docState.previewUrl} alt="Storefront evidence" className="max-h-60 object-contain rounded" />
              ) : (
                <div className="text-center p-6 text-[#667085]">
                  <FileImage className="w-10 h-10 mx-auto mb-2 text-[#98A2B3]" />
                  <p className="text-xs">Document stored in local demo repository</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#FAFCFE] border border-[#E4EAF2] rounded p-2.5 text-[10px] text-[#667085] space-y-1">
            <p className="font-semibold text-[#172B4D]">Paytm Vision OCR Extraction</p>
            <p>Model detected text blocks with localized bounding coordinates. Review individual values before writing to the merchant ledger.</p>
          </div>
        </div>

        {/* Right Pane: Extracted Fields Review (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E4EAF2] rounded-lg shadow-xs flex flex-col justify-between">
          <div>
            <div className="px-4 py-3 border-b border-[#E4EAF2] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-[#172B4D]">Extracted Business Fields</h3>
                <p className="text-[10px] text-[#667085]">Click any field to edit or confirm extracted text.</p>
              </div>
              <span className="text-[10px] font-semibold text-[#002970] bg-[#EDF3FB] px-2 py-0.5 rounded border border-[#D0E1F9]">
                5 Fields Tracked
              </span>
            </div>

            <div className="divide-y divide-[#E4EAF2]">
              {fieldKeys.map(k => (
                <FieldRow
                  key={k}
                  fieldKey={k}
                  field={fields[k] ?? { value: '', status: 'missing' }}
                  onUpdate={handleFieldUpdate}
                />
              ))}
            </div>
          </div>

          <div className="p-3.5 border-t border-[#E4EAF2] bg-[#FAFCFE] flex items-center justify-between">
            <span className="text-[11px] text-[#667085]">
              Confirming will apply verified values to the merchant record.
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmAll}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Confirm Extracted Fields →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
