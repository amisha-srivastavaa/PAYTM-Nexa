import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProfilerStep = 1 | 2 | 3 | 4 | 5;

interface StepDef {
  id: ProfilerStep;
  label: string;
  sublabel: string;
}

const STEPS: StepDef[] = [
  { id: 1, label: 'Details', sublabel: 'Business Profile' },
  { id: 2, label: 'Documents', sublabel: 'KYC & Signboard' },
  { id: 3, label: 'Validation', sublabel: 'Pre-check Rules' },
  { id: 4, label: 'Devices', sublabel: 'Paytm Hardware' },
  { id: 5, label: 'Application', sublabel: 'Review & Sign-off' },
];

interface StepIndicatorProps {
  current: ProfilerStep;
  completed: Set<ProfilerStep>;
  onNavigate: (step: ProfilerStep) => void;
}

export function StepIndicator({ current, completed, onNavigate }: StepIndicatorProps) {
  return (
    <nav aria-label="Onboarding workflow steps" className="w-full">
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {STEPS.map((step, idx) => {
          const isDone = completed.has(step.id);
          const isActive = current === step.id;
          const isAccessible = isDone || step.id <= current;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isAccessible && onNavigate(step.id)}
              disabled={!isAccessible}
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                'group flex flex-col sm:flex-row items-center sm:items-start gap-2 p-2 rounded-md border text-left transition-all',
                isActive
                  ? 'bg-white border-[#00BAF2] shadow-xs'
                  : isDone
                  ? 'bg-white border-[#E4EAF2] hover:border-[#16845B]'
                  : 'bg-[#FAFCFE] border-[#E4EAF2] opacity-70 cursor-not-allowed',
              )}
            >
              {/* Step circle / indicator */}
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors',
                  isActive
                    ? 'bg-[#002970] text-white ring-2 ring-[#00BAF2]/30'
                    : isDone
                    ? 'bg-[#ECFDF3] text-[#16845B] border border-[#A6F4C5]'
                    : 'bg-[#F2F4F7] text-[#667085] border border-[#EAECF0]',
                )}
              >
                {isDone ? <Check className="w-3 h-3 stroke-[2.5]" /> : step.id}
              </div>

              {/* Step text labels */}
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p
                  className={cn(
                    'text-[11px] font-semibold truncate leading-tight',
                    isActive ? 'text-[#002970]' : isDone ? 'text-[#172B4D]' : 'text-[#667085]',
                  )}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-[#667085] truncate hidden md:block mt-0.5 leading-none">
                  {step.sublabel}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
