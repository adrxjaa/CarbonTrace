"use client";

interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number; // 1-indexed
}

/**
 * 3-step progress indicator matching the provider/sponsor registration screenshots.
 * Completed steps show a green checkmark, active step shows the number in teal,
 * future steps show the number in dark with faint border.
 */
export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300
                  ${isCompleted
                    ? "bg-[#1D9E75] text-white"
                    : isActive
                    ? "bg-transparent border-2 border-[#1D9E75] text-[#1D9E75]"
                    : "bg-transparent border border-white/20 text-white/40"
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`text-[10px] uppercase tracking-widest font-semibold ${
                  isActive ? "text-[#1D9E75]" : isCompleted ? "text-[#1D9E75]/70" : "text-white/30"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-px mx-2 mb-5 relative">
                <div className="absolute inset-0 bg-white/10" />
                {isCompleted && (
                  <div className="absolute inset-0 bg-[#1D9E75] transition-all duration-500" />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
