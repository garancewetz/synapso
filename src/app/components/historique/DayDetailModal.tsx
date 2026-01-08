'use client';

import type { Victory } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/app/constants/exercice.constants';
import { VICTORY_EMOJIS, NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { formatShortDate, formatTime } from '@/app/utils/date.utils';
import { BottomSheetModal } from '@/app/components/ui';
import { VictoryCardCompact } from './VictoryCardCompact';

type DayExercise = {
  name: string;
  category: ExerciceCategory;
  completedAt: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  exercises: DayExercise[];
  victories: Victory[];
};

/**
 * Modale affichant le détail d'une journée du parcours
 * Design adapté aux personnes AVC : gros textes, couleurs contrastées, structure claire
 */
export function DayDetailModal({ isOpen, onClose, date, exercises, victories }: Props) {
  const formattedDate = date ? formatShortDate(date) : '';
  const hasContent = exercises.length > 0 || victories.length > 0;

  return (
    <BottomSheetModal 
      isOpen={isOpen && !!date} 
      onClose={onClose}
      showFooterClose
      closeLabel="Fermer"
    >
      {/* Header compact */}
      <div className="px-5 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{formattedDate}</h2>
        
        {/* Badges résumé */}
        <div className="flex items-center gap-2">
          {exercises.length > 0 && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              ✓ {exercises.length}
            </span>
          )}
          {victories.length > 0 && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
              {VICTORY_EMOJIS.STAR_BRIGHT} {victories.length}
            </span>
          )}
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        
        {/* Section Victoires */}
        {victories.length > 0 && (
          <section className="space-y-2">
            {victories.map((victory) => (
              <VictoryCardCompact key={victory.id} victory={victory} />
            ))}
          </section>
        )}

        {/* Section Exercices */}
        {exercises.length > 0 && (
          <section className="space-y-2">
            {exercises.map((exercise, index) => {
              const styles = CATEGORY_COLORS[exercise.category];
              
              return (
                <div
                  key={`${exercise.name}-${index}`}
                  className="bg-white rounded-xl border border-gray-200"
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* Badge icône avec fond coloré */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${styles.iconBg}`}>
                      <span className="text-lg">
                        {CATEGORY_ICONS[exercise.category]}
                      </span>
                    </div>
                    <span className="text-base font-medium text-gray-800 flex-1 truncate">
                      {exercise.name}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0 bg-gray-100 px-2 py-1 rounded-lg">
                      {formatTime(exercise.completedAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* État vide */}
        {!hasContent && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">{NAVIGATION_EMOJIS.CLIPBOARD}</span>
            </div>
            <p className="text-gray-700 text-lg font-semibold">Jour de repos</p>
            <p className="text-gray-400 text-sm mt-1">Chaque jour est différent, c&apos;est ok !</p>
          </div>
        )}
      </div>
    </BottomSheetModal>
  );
}
