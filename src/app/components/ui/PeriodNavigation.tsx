import clsx from 'clsx';
import { ChevronIcon } from '@/app/components/ui/icons';

type Props = {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
};

export function PeriodNavigation({ 
  label, 
  onPrevious, 
  onNext, 
  canGoBack, 
  canGoForward 
}: Props) {
  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onPrevious}
        disabled={!canGoBack}
        className={clsx(
          'p-2 rounded-lg transition-colors',
          canGoBack 
            ? 'text-gray-700 hover:bg-gray-100 active:bg-gray-200' 
            : 'text-gray-300 cursor-not-allowed'
        )}
        aria-label="Période précédente"
      >
        <ChevronIcon className="w-5 h-5" direction="left" />
      </button>
      
      <span className="text-sm font-medium text-gray-700 min-w-[180px] text-center">
        {label}
      </span>
      
      <button
        onClick={onNext}
        disabled={!canGoForward}
        className={clsx(
          'p-2 rounded-lg transition-colors',
          canGoForward 
            ? 'text-gray-700 hover:bg-gray-100 active:bg-gray-200' 
            : 'text-gray-300 cursor-not-allowed'
        )}
        aria-label="Période suivante"
      >
        <ChevronIcon className="w-5 h-5" direction="right" />
      </button>
    </div>
  );
}

