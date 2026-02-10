'use client';

import { useDayDetailModal } from '@/app/contexts/DayDetailModalContext';
import { useDayDetailData, DayDetailModal } from '@/app/features/historique';

export function DayDetailModalWrapper() {
  const { selectedDay, closeDayDetail } = useDayDetailModal();
  const { exercises, progressList } = useDayDetailData(selectedDay);

  return (
    <DayDetailModal
      isOpen={!!selectedDay}
      onClose={closeDayDetail}
      date={selectedDay?.date || null}
      exercises={exercises}
      progress={progressList}
    />
  );
}

