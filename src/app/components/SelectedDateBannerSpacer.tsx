'use client';

import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { isToday } from 'date-fns';

/**
 * Composant qui ajoute un espacement en haut du contenu
 * quand la bannière de date sélectionnée est visible
 */
export function SelectedDateBannerSpacer() {
  const { selectedDate, isDateSelected } = useSelectedDate();

  // Afficher l'espacement si une date est sélectionnée et que ce n'est pas aujourd'hui
  if (!isDateSelected || !selectedDate || isToday(selectedDate)) {
    return null;
  }

  // Hauteur de la bannière (py-3 = 12px top + 12px bottom + ~20px texte = ~44px, on met 60px pour être sûr)
  return <div className="h-[60px]" />;
}
