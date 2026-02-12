import { BODYPART_COLORS, AVAILABLE_BODYPARTS } from '@/app/constants/exercice.constants';
import { CheckIcon } from '@/app/components/ui/icons';
import clsx from 'clsx';

type Props = {
  selectedBodyparts: string[];
  onToggleBodypart: (bodypart: string) => void;
};

export function ExerciceFormBodyparts({ selectedBodyparts, onToggleBodypart }: Props) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 md:p-6">
      <label className="block text-base font-semibold text-gray-800 mb-2">
        Parties du corps ciblées
      </label>
      <p className="text-sm text-gray-500 mb-4">Sélectionnez une ou plusieurs parties du corps</p>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_BODYPARTS.map((bodypart) => {
          const isSelected = selectedBodyparts.includes(bodypart);
          const colorClass = BODYPART_COLORS[bodypart] || 'bg-gray-100 text-gray-600';
          
          return (
            <button
              key={bodypart}
              type="button"
              onClick={() => onToggleBodypart(bodypart)}
              className={clsx(
                'px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
                'active:scale-[0.98]',
                colorClass,
                isSelected 
                  ? 'border-2 border-gray-400 ring-2 ring-offset-2 ring-gray-400 font-semibold' 
                  : 'border border-transparent font-medium md:hover:ring-2 md:hover:ring-gray-300/50 md:hover:ring-offset-2'
              )}
            >
              {bodypart}
              {isSelected && (
                <CheckIcon className="inline-block w-3.5 h-3.5 ml-1" strokeWidth={2.5} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
