'use client';

import { useMemo } from 'react';
import type { Progress } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/app/constants/exercice.constants';
import { PROGRESS_EMOJIS, NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { formatShortDate, formatTime } from '@/app/utils/date.utils';
import { isToday, subDays, isBefore, isAfter, startOfDay } from 'date-fns';
import { BottomSheetModal, Button } from '@/app/components/ui';
import { ProgressCardCompact } from './ProgressCardCompact';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { useToast } from '@/app/contexts/ToastContext';
import { MAX_TIME_MACHINE_DAYS } from '@/app/constants/historique.constants';
import clsx from 'clsx';

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
  progress: Progress[];
};

/**
 * Modale affichant le détail d'une journée du parcours
 * Design adapté aux personnes AVC : gros textes, couleurs contrastées, structure claire
 */
export function DayDetailModal({ isOpen, onClose, date, exercises, progress }: Props) {
  const formattedDate = date ? formatShortDate(date) : '';
  const hasContent = exercises.length > 0 || progress.length > 0;
  const { setSelectedDate, clearSelectedDate, isTimeMachineMode } = useSelectedDate();
  const { showToast } = useToast();
  const isPastDay = date && !isToday(date);
  const isCurrentDay = date && isToday(date);
  const hasNoExercises = exercises.length === 0;

  // Vérifier si on peut ajouter des exercices pour ce jour (limite de 30 jours, pas de futur)
  const canAddExercises = useMemo(() => {
    if (!date || !isPastDay) return false;
    
    // ⚡ VALIDATION: Ne pas permettre les dates futures
    const today = startOfDay(new Date());
    if (isAfter(startOfDay(date), today)) {
      return false;
    }
    
    // ⚡ VALIDATION: Vérifier la limite de 30 jours
    const minAllowedDate = subDays(new Date(), MAX_TIME_MACHINE_DAYS);
    return !isBefore(date, minAllowedDate);
  }, [date, isPastDay]);

  const handleAddExercisesForDay = () => {
    if (!date) return;
    
    // ⚡ VALIDATION: Vérifier que la date n'est pas dans le futur
    const today = startOfDay(new Date());
    if (isAfter(startOfDay(date), today)) {
      showToast('Tu ne peux pas voyager vers le futur');
      return;
    }
    
    // ⚡ VALIDATION: Vérifier si la date est trop ancienne (plus de 30 jours)
    const minAllowedDate = subDays(new Date(), MAX_TIME_MACHINE_DAYS);
    if (isBefore(date, minAllowedDate)) {
      showToast(`Tu ne peux remonter que jusqu'à ${MAX_TIME_MACHINE_DAYS} jours en arrière`);
      return;
    }
    
    setSelectedDate(date);
    onClose();
  };

  const handleReturnToToday = () => {
    clearSelectedDate();
    onClose();
  };

  return (
    <BottomSheetModal 
      isOpen={isOpen && !!date} 
      onClose={onClose}
      showFooterClose
      closeLabel="Fermer"
    >
      {/* Header compact */}
      <div className="px-5 py-4 flex items-center justify-between md:pr-14">
        <h2 className="text-lg font-bold text-gray-900">{formattedDate}</h2>
        
        {/* Badges résumé */}
        <div className="flex items-center gap-2">
          {exercises.length > 0 && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              ✓ {exercises.length}
            </span>
          )}
          {progress.length > 0 && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
              {PROGRESS_EMOJIS.STAR_BRIGHT} {progress.length}
            </span>
          )}
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        
        {/* Section Progrès */}
        {progress.length > 0 && (
          <section className="space-y-2">
            {progress.map((item) => (
              <ProgressCardCompact key={item.id} progress={item} />
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

        {/* État vide ou pas d'exercices */}
        {!hasContent && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">{NAVIGATION_EMOJIS.CLIPBOARD}</span>
            </div>
            <p className="text-gray-700 text-lg font-semibold">
              {hasNoExercises && isPastDay
                ? `Aucun exercice fait le ${formattedDate}`
                : 'Jour de repos'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {hasNoExercises && isPastDay
                ? canAddExercises
                  ? 'Tu as oublié de noter tes exercices ?'
                  : `Tu ne peux remonter que jusqu'à ${MAX_TIME_MACHINE_DAYS} jours en arrière`
                : "Chaque jour est différent, c'est ok !"}
            </p>
            {hasNoExercises && isPastDay && canAddExercises && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="secondary"
                  onClick={handleAddExercisesForDay}
                  className={clsx(
                    'px-6 py-3',
                    '!bg-amber-400 !hover:bg-amber-500 !active:bg-amber-600',
                    '!text-amber-900 font-bold',
                    '!border-2 !border-amber-600',
                    'shadow-md hover:shadow-lg transition-shadow'
                  )}
                >
                  <span className="mr-2 text-lg">{NAVIGATION_EMOJIS.HOURGLASS}</span>
                  Ajouter des exercices pour ce jour
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Bouton pour ajouter des exercices même s'il y en a déjà (jour passé) */}
        {isPastDay && hasContent && canAddExercises && (
          <div className="pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-4">
                Tu veux ajouter ou modifier des exercices pour ce jour ?
              </p>
              <div className="flex justify-center">
                <Button
                  variant="secondary"
                  onClick={handleAddExercisesForDay}
                  className={clsx(
                    'px-6 py-3',
                    '!bg-amber-400 !hover:bg-amber-500 !active:bg-amber-600',
                    '!text-amber-900 font-bold',
                    '!border-2 !border-amber-600',
                    'shadow-md hover:shadow-lg transition-shadow'
                  )}
                >
                  <span className="mr-2 text-lg">{NAVIGATION_EMOJIS.HOURGLASS}</span>
                  Ajouter des exercices pour ce jour
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bouton pour revenir à aujourd'hui si on est en mode sablier et qu'on clique sur aujourd'hui */}
        {isTimeMachineMode && isCurrentDay && (
          <div className="pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-4">
                Tu es en mode sablier. Revenir à aujourd'hui ?
              </p>
              <div className="flex justify-center">
                <Button
                  variant="primary"
                  onClick={handleReturnToToday}
                  className={clsx(
                    'px-6 py-3',
                    '!bg-emerald-500 !hover:bg-emerald-600 !active:bg-emerald-700',
                    '!text-white font-bold',
                    'shadow-md hover:shadow-lg transition-shadow'
                  )}
                >
                  <span className="mr-2 text-lg">🏠</span>
                  Revenir à aujourd'hui
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BottomSheetModal>
  );
}
