import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileImage, AlertCircle, CheckCircle2, RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AlertBanner, Spinner, DemoNotice } from '@/components/ui/shared';
import { cn, formatFileSize } from '@/lib/utils';
import { addDocument, updateDocument } from '@/lib/store';
import type { Merchant, MerchantDocument, ExtractedField } from '@/types';

interface DocumentUploadProps {
  merchant: Merchant;
  onDocumentReady: (doc: MerchantDocument) => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export function DocumentUpload({ merchant, onDocumentReady }: DocumentUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [extractedDoc, setExtractedDoc] = useState<MerchantDocument | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = useCallback((f: File) => {
    setError(null);
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError('Unsupported file type. Please upload a JPEG, PNG, WebP, or PDF document.');
      return;
    }
    if (f.size > MAX_SIZE) {
      setError(`File is too large. Maximum size is 10 MB (selected file is ${formatFileSize(f.size)}).`);
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    setExtractedDoc(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
  }, [validateAndSetFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) validateAndSetFile(picked);
  };

  const handleSimulateExtraction = async () => {
    if (!file) return;
    setProcessing(true);

    // Simulated OCR extraction pipeline for hackathon demo
    await new Promise(r => setTimeout(r, 1200));

    // Realistic extraction based on merchant's current state or file name
    const detectedName = merchant.businessName || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const detectedOwner = merchant.ownerName || 'Detected Proprietor';

    const extractedFields: Record<string, ExtractedField> = {
      businessName: {
        value: detectedName,
        status: 'needs_review',
        confidence: 0.88,
        evidence: `Text detected on storefront fascia banner: "${detectedName}"`,
      },
      ownerName: {
        value: detectedOwner,
        status: 'needs_review',
        confidence: 0.76,
        evidence: 'Proprietor name extracted from tax license or license board',
      },
      phone: {
        value: merchant.phone || '',
        status: merchant.phone ? 'user_confirmed' : 'missing',
        confidence: merchant.phone ? 0.95 : undefined,
        evidence: merchant.phone ? 'Verified from phone contact record' : undefined,
      },
      address: {
        value: merchant.address?.line1 ? `${merchant.address.line1}, ${merchant.address.city}` : 'Main Road, Market Area',
        status: 'needs_review',
        confidence: 0.72,
        evidence: 'Physical premises address detected on signboard text',
      },
      gstin: {
        value: merchant.gstin || '',
        status: merchant.gstin ? 'user_confirmed' : 'missing',
        confidence: merchant.gstin ? 0.99 : undefined,
        evidence: merchant.gstin ? '15-digit GSTIN matching state format' : undefined,
      },
    };

    const doc = addDocument({
      merchantId: merchant.id,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      previewUrl: previewUrl ?? undefined,
      extractionStatus: 'completed',
      extractedFields,
    });

    updateDocument(doc.id, { extractionStatus: 'completed' });
    setExtractedDoc(doc);
    setProcessing(false);
    onDocumentReady(doc);
  };

  const handleRemove = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setExtractedDoc(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const loadSampleDocument = () => {
    // Helper to simulate picking a shop photo for rapid demo evaluation
    const sampleBlob = new Blob(['sample-shop-image'], { type: 'image/jpeg' });
    const sampleFile = new File([sampleBlob], 'sharma_sweets_storefront.jpg', { type: 'image/jpeg' });
    validateAndSetFile(sampleFile);
  };

  return (
    <div className="space-y-4">
      {/* Upload Box */}
      {!file ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all bg-[#FAFCFE]',
            dragOver ? 'border-[#00BAF2] bg-[#EBF9FE]' : 'border-[#D0D5DD] hover:border-[#00BAF2]',
          )}
        >
          <div className="w-10 h-10 rounded-full bg-[#EDF3FB] text-[#002970] flex items-center justify-center mx-auto mb-3">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-[#172B4D]">
            Drag and drop shop signboard, GST certificate, or electricity bill
          </p>
          <p className="text-[11px] text-[#667085] mt-1 max-w-sm mx-auto">
            Supported formats: JPEG, PNG, WebP, or PDF up to 10 MB.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              Browse Files
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSampleDocument}
            >
              Load Sample Shop Photo
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      ) : (
        /* File Selected / Preview Workspace */
        <div className="border border-[#E4EAF2] rounded-lg p-4 bg-white space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#EDF3FB] border border-[#D0E1F9] flex items-center justify-center text-[#002970] flex-shrink-0">
                {file.type.startsWith('image/') ? <FileImage className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#172B4D] truncate">{file.name}</p>
                <p className="text-[10px] text-[#667085]">{formatFileSize(file.size)} · {file.type}</p>
              </div>
            </div>
            {!processing && (
              <button
                onClick={handleRemove}
                className="text-[#667085] hover:text-[#D92D20] p-1 rounded hover:bg-[#FEF3F2] transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {previewUrl && (
            <div className="relative rounded border border-[#E4EAF2] bg-[#F8F9FC] max-h-48 overflow-hidden flex items-center justify-center">
              <img src={previewUrl} alt="Storefront preview" className="object-contain max-h-48 w-full" />
            </div>
          )}

          {/* Action to Trigger Extraction */}
          {!extractedDoc && (
            <div className="flex items-center justify-between pt-2 border-t border-[#E4EAF2]">
              <span className="text-[11px] text-[#667085]">
                Ready to extract shop name, proprietor name, and address.
              </span>
              <Button
                variant="cyan"
                size="sm"
                onClick={handleSimulateExtraction}
                loading={processing}
                leftIcon={<RefreshCw className={cn('w-3.5 h-3.5', processing && 'animate-spin')} />}
              >
                Run AI Extraction
              </Button>
            </div>
          )}
        </div>
      )}

      {error && (
        <AlertBanner variant="error" title="Upload Error">
          {error}
        </AlertBanner>
      )}

      <div className="pt-1">
        <DemoNotice>
          Document extraction executes a client-side simulation mimicking Paytm Vision OCR. No external cloud credentials required.
        </DemoNotice>
      </div>
    </div>
  );
}
