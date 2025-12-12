'use client';

import WelcomeHeader from '@/app/components/molecules/WelcomeHeader';
import { useUser } from '@/contexts/UserContext';
import { useTodayCompletedCount } from '@/hooks/useTodayCompletedCount';
import { USE_MOCK_DATA } from '@/datas/mockExercices';

export default function WelcomeHeaderWrapper() {
  const { currentUser } = useUser();
  const completedToday = useTodayCompletedCount();
  const displayName = USE_MOCK_DATA ? "Calypso" : (currentUser?.name || "");

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4">
      <WelcomeHeader
        userName={displayName}
        completedToday={completedToday}
      />
    </div>
  );
}

