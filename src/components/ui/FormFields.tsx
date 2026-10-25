import { cn } from '@/lib/utils';
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

// ─── Input ─────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  leftElement?: React.ReactNode;
}

export function Input({ label, error, hint, required, leftElement, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-[#172B4D] flex items-center justify-between">
          <span>
            {label}
            {required && <span className="text-[#D92D20] ml-0.5" aria-hidden>*</span>}
          </span>
        </label>
      )}
      <div className="relative">
        {leftElement && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-[#667085] pointer-events-none">
            {leftElement}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full h-8 px-3 text-xs border rounded bg-white text-[#172B4D] placeholder:text-[#98A2B3] transition-colors',
            'border-[#E4EAF2] hover:border-[#CBD5E1]',
            'focus:outline-none focus:ring-1.5 focus:ring-[#00BAF2] focus:border-[#00BAF2]',
            'disabled:bg-[#F5F8FC] disabled:text-[#98A2B3] disabled:cursor-not-allowed',
            error ? 'border-[#D92D20] focus:ring-[#D92D20] focus:border-[#D92D20]' : '',
            leftElement && 'pl-8',
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
      </div>
      {error && <p id={`${inputId}-error`} className="text-[11px] text-[#D92D20] font-medium mt-0.5" role="alert">{error}</p>}
      {!error && hint && <p id={`${inputId}-hint`} className="text-[11px] text-[#667085] mt-0.5">{hint}</p>}
    </div>
  );
}

// ─── Select ────────────────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, hint, required, options, placeholder, className, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-[#172B4D]">
          {label}
          {required && <span className="text-[#D92D20] ml-0.5" aria-hidden>*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full h-8 px-3 text-xs border rounded bg-white text-[#172B4D] transition-colors',
          'border-[#E4EAF2] hover:border-[#CBD5E1]',
          'focus:outline-none focus:ring-1.5 focus:ring-[#00BAF2] focus:border-[#00BAF2]',
          'disabled:bg-[#F5F8FC] disabled:cursor-not-allowed',
          error ? 'border-[#D92D20]' : '',
          className,
        )}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-[11px] text-[#D92D20] font-medium mt-0.5" role="alert">{error}</p>}
      {!error && hint && <p className="text-[11px] text-[#667085] mt-0.5">{hint}</p>}
    </div>
  );
}

// ─── Textarea ──────────────────────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function Textarea({ label, error, hint, required, className, id, ...props }: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={textareaId} className="text-xs font-medium text-[#172B4D]">
          {label}
          {required && <span className="text-[#D92D20] ml-0.5" aria-hidden>*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'w-full px-3 py-2 text-xs border rounded bg-white text-[#172B4D] placeholder:text-[#98A2B3] resize-none transition-colors',
          'border-[#E4EAF2] hover:border-[#CBD5E1]',
          'focus:outline-none focus:ring-1.5 focus:ring-[#00BAF2] focus:border-[#00BAF2]',
          error ? 'border-[#D92D20]' : '',
          className,
        )}
        rows={3}
        {...props}
      />
      {error && <p className="text-[11px] text-[#D92D20] font-medium mt-0.5" role="alert">{error}</p>}
      {!error && hint && <p className="text-[11px] text-[#667085] mt-0.5">{hint}</p>}
    </div>
  );
}

// ─── Checkbox ──────────────────────────────────────────────────────────────
interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  id?: string;
}

export function Checkbox({ label, checked, onChange, description, id }: CheckboxProps) {
  const checkId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <label htmlFor={checkId} className="flex gap-2.5 cursor-pointer group items-start">
      <input
        id={checkId}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-[#D0D5DD] text-[#00BAF2] focus:ring-[#00BAF2]"
      />
      <div>
        <span className="text-xs font-medium text-[#172B4D] group-hover:text-[#002970]">{label}</span>
        {description && <p className="text-[11px] text-[#667085] mt-0.5 leading-normal">{description}</p>}
      </div>
    </label>
  );
}
