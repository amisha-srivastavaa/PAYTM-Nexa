import type { ValidationIssue, Merchant, ApplicationFormData } from '@/types';
import { isValidPhone, isValidGstin, isValidPincode, isValidEmail } from '@/lib/utils';

export function validateMerchant(m: Partial<Merchant>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!m.businessName?.trim()) {
    issues.push({ fieldName: 'businessName', issueCode: 'required', message: 'Business name is required', status: 'open' });
  }
  if (!m.ownerName?.trim()) {
    issues.push({ fieldName: 'ownerName', issueCode: 'required', message: 'Owner name is required', status: 'open' });
  }
  if (!m.phone?.trim()) {
    issues.push({ fieldName: 'phone', issueCode: 'required', message: 'Phone number is required', status: 'open' });
  } else if (!isValidPhone(m.phone)) {
    issues.push({ fieldName: 'phone', issueCode: 'invalid_format', message: 'Enter a valid 10-digit Indian mobile number', status: 'open' });
  }
  if (!m.businessType) {
    issues.push({ fieldName: 'businessType', issueCode: 'required', message: 'Business type is required', status: 'open' });
  }
  if (!m.address?.line1?.trim()) {
    issues.push({ fieldName: 'address.line1', issueCode: 'required', message: 'Street address is required', status: 'open' });
  }
  if (!m.address?.city?.trim()) {
    issues.push({ fieldName: 'address.city', issueCode: 'required', message: 'City is required', status: 'open' });
  }
  if (!m.address?.state?.trim()) {
    issues.push({ fieldName: 'address.state', issueCode: 'required', message: 'State is required', status: 'open' });
  }
  if (!m.address?.pincode?.trim()) {
    issues.push({ fieldName: 'address.pincode', issueCode: 'required', message: 'Pincode is required', status: 'open' });
  } else if (!isValidPincode(m.address.pincode)) {
    issues.push({ fieldName: 'address.pincode', issueCode: 'invalid_format', message: 'Enter a valid 6-digit pincode', status: 'open' });
  }
  if (m.gstin && !isValidGstin(m.gstin)) {
    issues.push({ fieldName: 'gstin', issueCode: 'invalid_format', message: 'GSTIN format is invalid (e.g. 29ABCDE1234F1Z5)', status: 'open' });
  }
  if (m.email && !isValidEmail(m.email)) {
    issues.push({ fieldName: 'email', issueCode: 'invalid_format', message: 'Enter a valid email address', status: 'open' });
  }

  return issues;
}

export function validateApplication(form: Partial<ApplicationFormData>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!form.businessName?.trim()) issues.push({ fieldName: 'businessName', issueCode: 'required', message: 'Business name is required', status: 'open' });
  if (!form.ownerName?.trim()) issues.push({ fieldName: 'ownerName', issueCode: 'required', message: 'Owner name is required', status: 'open' });
  if (!form.phone?.trim()) {
    issues.push({ fieldName: 'phone', issueCode: 'required', message: 'Phone number is required', status: 'open' });
  } else if (!isValidPhone(form.phone)) {
    issues.push({ fieldName: 'phone', issueCode: 'invalid_format', message: 'Enter a valid 10-digit Indian mobile number', status: 'open' });
  }
  if (!form.address?.line1?.trim()) issues.push({ fieldName: 'address', issueCode: 'required', message: 'Full address is required', status: 'open' });
  if (!form.deviceSetup) issues.push({ fieldName: 'deviceSetup', issueCode: 'required', message: 'Device setup must be selected', status: 'open' });

  return issues;
}

export function computeReadinessChecks(form: Partial<ApplicationFormData>) {
  return [
    { key: 'business_name', label: 'Business name provided', passed: Boolean(form.businessName?.trim()), message: form.businessName ? undefined : 'Business name is missing' },
    { key: 'owner_name', label: 'Owner name provided', passed: Boolean(form.ownerName?.trim()), message: form.ownerName ? undefined : 'Owner name is missing' },
    { key: 'phone', label: 'Valid phone number', passed: Boolean(form.phone && isValidPhone(form.phone)), message: form.phone && !isValidPhone(form.phone) ? 'Phone number format is invalid' : undefined },
    { key: 'address', label: 'Complete address', passed: Boolean(form.address?.line1 && form.address?.city && form.address?.state && form.address?.pincode), message: undefined },
    { key: 'device', label: 'Device setup selected', passed: Boolean(form.deviceSetup), message: form.deviceSetup ? undefined : 'Select a device recommendation first' },
  ];
}
