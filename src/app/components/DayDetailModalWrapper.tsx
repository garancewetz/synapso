'use client';

import { useDayDetailModal } from '@/app/contexts/DayDetailModalContext';
import { useDayDetailData } from '@/app/hooks/useDayDetailData';
import { useVictoryModal } from '@/app/hooks/useVictoryModal';
import { DayDetailModal } from '@/app/components/historique';

export function DayDetailModalWrapper() {
  const { selectedDay, closeDayDetail } = useDayDetailModal();
  const { exercises, victory } = useDayDetailData(selectedDay);
  const victoryModal = useVictoryModal();

  return (
    <DayDetailModal
      isOpen={!!selectedDay}
      onClose={closeDayDetail}
      date={selectedDay?.date || null}
      exercises={exercises}
      victory={victory}
      onEdit={victoryModal.openForEdit}
    />
  );
}

