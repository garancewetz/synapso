'use client';

import type { Progress } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';
import { PROGRESS_EMOJIS } from '@/app/constants/emoji.constants';
import { formatShortDate } from '@/app/utils/date.utils';
import { BottomSheetModal } from '@/app/components/ui';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { useToast } from '@/app/contexts/ToastContext';
import { isBefore, isAfter, startOfDay, subDays } from 'date-fns';
import { MAX_TIME_MACHINE_DAYS } from '@/app/constants/historique.constants';
import { DayDetailModalBody } from './DayDetailModalBody';

type DayExercise = {
  id: number;
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
  categoryStats?: Record<ExerciceCategory, number>;
};

export function DayDetailModal({ isOpen, onClose, date, exercises, progress, categoryStats }: Props) {
  const formattedDate = date ? formatShortDate(date) : '';
  const { setSelectedDate, clearSelectedDate } = useSelectedDate();
  const { showToast } = useToast();

  const handleAddExercisesForDay = () => {
    if (!date) return;
    const today = startOfDay(new Date());
    if (isAfter(startOfDay(date), today)) {
      showToast('Tu ne peux pas voyager vers le futur');
      return;
    }
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
      <div className="px-5 py-4 flex items-center justify-between md:pr-14">
        <h2 className="text-lg font-bold text-gray-900">{formattedDate}</h2>
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

      <DayDetailModalBody
        date={date}
        exercises={exercises}
        progress={progress}
        categoryStats={categoryStats}
        onAddExercisesForDay={handleAddExercisesForDay}
        onReturnToToday={handleReturnToToday}
      />
    </BottomSheetModal>
  );
}
