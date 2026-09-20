// app/(auth)/onboarding/components/StepIndicator.tsx
import { Check } from "lucide-react";

interface Step {
  id: number;
  name: string;
  shortName: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        const isClickable = step.id < currentStep && onStepClick;

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <button
              type="button"
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={`
                flex flex-col items-center gap-2 sm:flex-row sm:gap-3
                ${isClickable ? "cursor-pointer" : "cursor-default"}
              `}
            >
              <div
                className={`
                  w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                  font-semibold text-sm transition-all duration-300 flex-shrink-0
                  ${
                    isCompleted
                      ? "bg-neutral-900 text-white"
                      : isCurrent
                      ? "bg-neutral-900 text-white ring-4 ring-neutral-900/10"
                      : "bg-neutral-100 text-neutral-400"
                  }
                `}
              >
                {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : step.id}
              </div>

              {/* Label */}
              <div className="text-center sm:text-left">
                <p
                  className={`
                    text-xs sm:text-sm font-medium whitespace-nowrap
                    ${
                      isCurrent || isCompleted
                        ? "text-neutral-900"
                        : "text-neutral-400"
                    }
                  `}
                >
                  <span className="hidden sm:inline">{step.name}</span>
                  <span className="sm:hidden">{step.shortName}</span>
                </p>
              </div>
            </button>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 sm:mx-4">
                <div
                  className={`
                    h-0.5 w-full transition-all duration-300
                    ${step.id < currentStep ? "bg-neutral-900" : "bg-neutral-200"}
                  `}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}