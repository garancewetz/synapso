'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import WelcomeHeader from '@/app/components/molecules/WelcomeHeader';
import { useUser } from '@/contexts/UserContext';
import { useTodayCompletedCount } from '@/hooks/useTodayCompletedCount';
import { USE_MOCK_DATA } from '@/datas/mockExercices';

export default function WelcomeHeaderWrapper() {
  const pathname = usePathname();
  const { currentUser } = useUser();
  const completedToday = useTodayCompletedCount();
  const [resetFrequency, setResetFrequency] = useState<'DAILY' | 'WEEKLY' | null>(null);
  const displayName = USE_MOCK_DATA ? "Calypso" : (currentUser?.name || "");

  // Charger la fréquence de réinitialisation de l'utilisateur
  useEffect(() => {
    if (currentUser?.id && !USE_MOCK_DATA) {
      fetch(`/api/users/${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.resetFrequency) {
            setResetFrequency(data.resetFrequency);
          }
        })
        .catch(() => {
          // Ignorer les erreurs, utiliser la valeur par défaut
        });
    }
  }, [currentUser]);

  // Ne pas afficher sur les pages d'ajout/édition d'exercice
  const hideOnPages = ['/exercice/add', '/exercice/edit', '/aphasie/add', '/aphasie/edit'];
  const shouldHide = hideOnPages.some(path => pathname?.startsWith(path));

  if (shouldHide) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4">
      <WelcomeHeader
        userName={displayName}
        completedToday={completedToday}
        resetFrequency={resetFrequency}
      />
    </div>
  );
}

