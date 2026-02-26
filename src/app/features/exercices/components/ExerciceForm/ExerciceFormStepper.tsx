import clsx from 'clsx';

const STEPS = [
  { label: "L'exercice" },
  { label: 'Classification' },
  { label: 'Détails' },
];

type Props = {
  currentStep: number;
  maxVisitedStep: number;
  onStepClick: (step: number) => void;
  isEditMode?: boolean;
};

export function ExerciceFormStepper({ currentStep, maxVisitedStep, onStepClick, isEditMode }: Props) {
  return (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = isEditMode || index <= maxVisitedStep;

        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => isClickable && onStepClick(index)}
              disabled={!isClickable}
              className={clsx(
                'flex flex-col items-center gap-1.5 group',
                isClickable ? 'cursor-pointer' : 'cursor-default'
              )}
            >
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200',
                  isCurrent && 'bg-gray-800 text-white ring-2 ring-offset-2 ring-gray-400',
                  isCompleted && 'bg-gray-800 text-white',
                  !isCurrent && !isCompleted && 'bg-gray-200 text-gray-500'
                )}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={clsx(
                  'text-xs font-medium transition-colors hidden sm:block',
                  isCurrent ? 'text-gray-800' : 'text-gray-400'
                )}
              >
                {step.label}
              </span>
            </button>

            {index < STEPS.length - 1 && (
              <div
                className={clsx(
                  'flex-1 h-0.5 mx-3 transition-colors duration-200',
                  index < currentStep ? 'bg-gray-800' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
