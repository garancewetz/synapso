import { ExerciceCategory } from '@/app/types/exercice';
import { CATEGORY_LABELS_SHORT, CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import { CheckIcon } from '@/app/components/ui/icons';
import clsx from 'clsx';

type Props = {
  category: ExerciceCategory;
  onCategoryChange: (category: ExerciceCategory) => void;
};

export function ExerciceFormCategory({ category, onCategoryChange }: Props) {
  const categories: ExerciceCategory[] = CATEGORY_ORDER;

  return (
    <div>
      <label className="block text-base font-semibold text-gray-800 mb-3">
        Catégorie *
      </label>
      <div className="grid grid-cols-4 gap-2 max-w-full">
        {categories.map((cat) => {
          const isSelected = category === cat;
          const colors = CATEGORY_COLORS[cat];
          const icon = CATEGORY_ICONS[cat];
          
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={clsx(
                'p-2 md:p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                colors.focusRing,
                'active:scale-[0.98]',
                colors.bg,
                colors.cardBorder,
                isSelected 
                  ? clsx(colors.border, 'ring-2 ring-offset-2', colors.focusRing.replace('focus:', 'ring-'))
                  : 'md:hover:ring-2 md:hover:ring-gray-300/50 md:hover:ring-offset-2'
              )}
              aria-pressed={isSelected}
            >
              <div className="text-3xl md:text-4xl mb-2">{icon}</div>
              <div className={clsx('text-sm md:text-base font-medium', colors.text)}>
                {CATEGORY_LABELS_SHORT[cat]}
              </div>
              {isSelected && (
                <CheckIcon className="w-5 h-5 mt-2" strokeWidth={2.5} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
