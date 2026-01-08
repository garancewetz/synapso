'use client';

import { useDayDetailModal } from '@/app/contexts/DayDetailModalContext';
import { useDayDetailData } from '@/app/hooks/useDayDetailData';
import { DayDetailModal } from '@/app/components/historique';

export function DayDetailModalWrapper() {
  const { selectedDay, closeDayDetail } = useDayDetailModal();
  const { exercises, victories } = useDayDetailData(selectedDay);

  return (
    <DayDetailModal
      isOpen={!!selectedDay}
      onClose={closeDayDetail}
      date={selectedDay?.date || null}
      exercises={exercises}
      victories={victories}
    />
  );
}

