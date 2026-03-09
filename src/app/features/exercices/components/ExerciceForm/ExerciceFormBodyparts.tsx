import {
  BODYPART_COLORS,
  BODYPART_ICONS,
  AVAILABLE_BODYPARTS,
  BODYPART_TO_CATEGORY,
  CATEGORY_COLORS,
} from '@/app/constants/exercice.constants';
import type { ExerciceCategory } from '@/app/types/exercice';
import { CheckIcon } from '@/app/components/ui/icons';
import clsx from 'clsx';

const BODYPART_CATEGORIES: Array<'UPPER_BODY' | 'CORE' | 'LOWER_BODY' | 'FACE'> = [
  'UPPER_BODY',
  'CORE',
  'LOWER_BODY',
  'FACE',
];

type Props = {
  selectedBodyparts: string[];
  onToggleBodypart: (bodypart: string) => void;
};

export function ExerciceFormBodyparts({ selectedBodyparts, onToggleBodypart }: Props) {
  const bodypartsByCategory = BODYPART_CATEGORIES.map((category) =>
    AVAILABLE_BODYPARTS.filter((bp) => BODYPART_TO_CATEGORY[bp] === category)
  );

  return (
    <div className="bg-gray-50 rounded-lg p-4 md:p-6">
      <label className="block text-base font-semibold text-gray-800 mb-2">
        Parties du corps ciblées
      </label>
      <p className="text-sm text-gray-500 mb-4">Sélectionnez une ou plusieurs parties du corps</p>
      <div className="space-y-3">
        {bodypartsByCategory.map((bodyparts) => (
          <div key={bodyparts[0]} className="flex flex-wrap gap-2">
            {bodyparts.map((bodypart) => {
              const isSelected = selectedBodyparts.includes(bodypart);
              const colorClass = BODYPART_COLORS[bodypart] || 'bg-gray-100 text-gray-600';
              const category = BODYPART_TO_CATEGORY[bodypart] as ExerciceCategory | undefined;
              const borderClass = category ? CATEGORY_COLORS[category].border : 'border-gray-200';
              return (
                <button
                  key={bodypart}
                  type="button"
                  onClick={() => onToggleBodypart(bodypart)}
                  className={clsx(
                    'px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
                    'active:scale-[0.98]',
                    'border-2',
                    colorClass,
                    isSelected
                      ? 'border-gray-400 ring-2 ring-offset-2 ring-gray-400 font-semibold'
                      : clsx(borderClass, 'font-medium md:hover:ring-2 md:hover:ring-gray-300/50 md:hover:ring-offset-2')
                  )}
                >
                  {BODYPART_ICONS[bodypart] && (
                    <span className="mr-1.5" role="img" aria-hidden="true">
                      {BODYPART_ICONS[bodypart]}
                    </span>
                  )}
                  {bodypart}
                  {isSelected && (
                    <CheckIcon className="inline-block w-3.5 h-3.5 ml-1" strokeWidth={2.5} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
