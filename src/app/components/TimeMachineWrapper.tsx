'use client';

import clsx from 'clsx';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';

type Props = {
  children: React.ReactNode;
};

/**
 * Composant qui ajoute un cadre visuel discret à l'application
 * quand on est en mode "sablier" (remonter le temps)
 * ⚡ MODE SABLIER: Fond blanc maintenu + cadre indigo discret pour distinction claire
 */
export function TimeMachineWrapper({ children }: Props) {
  const { isTimeMachineMode } = useSelectedDate();

  return (
    <div 
      className={clsx(
        'relative min-h-screen transition-all duration-300',
        // ⚡ MODE SABLIER: Fond blanc maintenu pour simplicité et clarté
        'bg-white',
        // ⚡ MODE SABLIER: Cadre indigo discret pour distinction claire du mode sablier
        isTimeMachineMode && [
          'border-2 border-indigo-500/40',
          'shadow-[0_0_0_1px_rgba(99,102,241,0.15)]',
          'ring-1 ring-indigo-400/20'
        ]
      )}
    >
      {children}
    </div>
  );
}
