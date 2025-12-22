'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import WelcomeHeader from '@/app/components/WelcomeHeader';
import { useUser } from '@/app/contexts/UserContext';
import { useTodayCompletedCount } from '@/app/hooks/useTodayCompletedCount';

export default function WelcomeHeaderWrapper() {
  const pathname = usePathname();
  const { currentUser } = useUser();
  const completedToday = useTodayCompletedCount();
  const [resetFrequency, setResetFrequency] = useState<'DAILY' | 'WEEKLY' | null>(null);
  const displayName = currentUser?.name || "";

  // Charger la fréquence de réinitialisation de l'utilisateur
  useEffect(() => {
    if (currentUser?.id) {
      fetch(`/api/users/${currentUser.id}`, { credentials: 'include' })
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

  // Ne pas afficher sur les pages d'ajout/édition d'exercice et sur l'historique
  const hideOnPages = ['/exercice/add', '/exercice/edit', '/aphasie/add', '/aphasie/edit', '/historique'];
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
