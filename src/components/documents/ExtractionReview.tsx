import { useState } from 'react';
import { CheckCircle2, Edit3, AlertTriangle, X, Check, FileImage, ClipboardList } from 'lucide-react';
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
  delay: number;
}

function FieldRow({ fieldKey, field, onUpdate, delay }: FieldRowProps) {
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
      'field-reveal p-3 border-b border-[#E4EAF2] last:border-0 transition-colors',
      needsReview ? 'bg-[#FFFAEB]/40' : 'bg-white',
    )} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-xs font-semibold text-[#172B4D]">{FIELD_LABELS[fieldKey] ?? fieldKey}</span>
            <FieldStatusBadge status={field.status} />
            {field.confidence !== undefined && (
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                field.confidence >= 0.85 ? 'bg-[#ECFDF3] text-[#16845B]' : field.confidence >= 0.65 ? 'bg-[#FFFAEB] text-[#a7650a]' : 'bg-[#FEF3F2] text-[#c54545]',
              )}>
                {Math.round(field.confidence * 100)}% confidence
              </span>
            )}
            {needsReview && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#fff2dc] text-[#87540e] font-semibold">Needs review</span>}
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
                className="touch-target text-[#667085] hover:text-[#002970] p-2 rounded-lg hover:bg-[#F5F8FC] transition-colors"
                title="Correct extracted field"
                aria-label={`Correct ${FIELD_LABELS[fieldKey] ?? fieldKey}`}
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
  const [showTrace, setShowTrace] = useState(false);

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
    const auditEntry = updates.status === 'user_confirmed' && updates.value !== undefined && updates.value !== fields[key]?.value
      ? {
        fieldKey: key,
        sourceValue: fields[key]?.value ?? '',
        correctedValue: updates.value,
        changedAt: new Date().toISOString(),
        changedBy: 'field agent' as const,
      }
      : undefined;
    const newDoc = updateDocument(docState.id, {
      extractedFields: updated,
      ...(auditEntry ? { auditTrail: [...(docState.auditTrail ?? []), auditEntry] } : {}),
    });
    if (!newDoc) throw new Error(`Could not save extracted field ${key} for document ${docState.id}`);
    setDocState(newDoc);
  };

  const handleConfirmAll = () => {
    // Sync confirmed values back to merchant record
    const updates: Partial<Merchant> = {};
    if (fields.businessName?.value) updates.businessName = fields.businessName.value;
    if (fields.ownerName?.value) updates.ownerName = fields.ownerName.value;
    if (fields.phone?.value) updates.phone = fields.phone.value;
    if (fields.gstin?.value) updates.gstin = fields.gstin.value;
    if (fields.address?.value) {
      const [line1, city] = fields.address.value.split(',').map(part => part.trim());
      updates.address = { ...merchant.address, line1, ...(city ? { city } : {}) };
    }

    const updatedMerchant = updateMerchant(merchant.id, updates);
    if (!updatedMerchant) throw new Error(`Could not update merchant ${merchant.id} with reviewed extraction`);
    onConfirmed(docState);
  };

  const needsReviewCount = Object.values(fields).filter(f => f.status === 'needs_review').length;
  const correctedFields = docState.auditTrail ?? [];

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
              AI read · reviewable
              </span>
            </div>

            <p className="text-[11px] text-[#667085] mb-2 truncate">Source: {docState.fileName}</p>

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
            <p className="font-semibold text-[#172B4D]">NEXA document read · local demo simulation</p>
            <p>Values and evidence shown here are illustrative. Review each field before updating the merchant profile.</p>
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
              {fieldKeys.map((k, index) => (
                <FieldRow
                  key={k}
                  fieldKey={k}
                  field={fields[k] ?? { value: '', status: 'missing' }}
                  onUpdate={handleFieldUpdate}
                  delay={index * 110}
                />
              ))}
            </div>
          </div>

          <div className="sticky bottom-16 z-10 space-y-2 border-t border-[#E4EAF2] bg-[#FAFCFE] p-3.5 md:bottom-0">
            <button
              type="button"
              onClick={() => setShowTrace(current => !current)}
              aria-expanded={showTrace}
              className="touch-target inline-flex items-center gap-2 text-xs font-semibold text-[#007FA5] hover:text-[#09254b]"
            >
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
              {showTrace ? 'Hide AI read & correction trail' : 'View AI read & correction trail'}
            </button>
            {showTrace && (
              <div className="rounded-xl border border-[#D8ECF8] bg-white p-3 text-xs" aria-live="polite">
                <p className="font-semibold text-[#09254b]">AI read from {docState.fileName}</p>
                <ul className="mt-2 space-y-1.5 text-[#52677d]">
                  {Object.entries(fields).map(([key, field]) => (
                    <li key={key}>
                      <span className="font-semibold">{FIELD_LABELS[key] ?? key}:</span> “{field.value || 'No value detected'}”
                      {field.evidence ? ` · ${field.evidence}` : ''}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 border-t border-[#D8ECF8] pt-2">
                  <p className="font-semibold text-[#09254b]">Agent corrections</p>
                  {correctedFields.length ? correctedFields.map((entry, index) => (
                    <p key={`${entry.fieldKey}-${index}`} className="mt-1 text-[#52677d]">
                      {FIELD_LABELS[entry.fieldKey] ?? entry.fieldKey}: “{entry.sourceValue}” → “{entry.correctedValue}” · confirmed by {entry.changedBy}
                    </p>
                  )) : <p className="mt-1 text-[#71859A]">No corrections yet. Inline edits will be recorded here.</p>}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[11px] text-[#667085]">
                Confirming applies reviewed values to this local merchant profile.
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmAll}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Confirm reviewed fields
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
