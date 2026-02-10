'use client';

import clsx from 'clsx';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';

type Props = {
  children: React.ReactNode;
};

/**
 * Composant qui ajoute un cadre visuel immersif à l'application
 * quand on est en mode "sablier" (remonter le temps)
 * ⚡ MODE SABLIER: Fond indigo cosmique avec pattern d'étoiles + cadre indigo épais pour immersion maximale
 */
export function TimeMachineWrapper({ children }: Props) {
  const { isTimeMachineMode } = useSelectedDate();

  return (
    <div 
      className={clsx(
        'relative min-h-screen transition-all duration-300',
        // ⚡ MODE SABLIER: Fond indigo cosmique avec pattern d'étoiles subtil pour immersion
        isTimeMachineMode 
          ? 'bg-indigo-50' // Fond indigo très léger pour immersion sans perte de lisibilité
          : 'bg-white',
        // ⚡ MODE SABLIER: Cadre indigo épais et visible avec effet de lueur cosmique prononcé
        isTimeMachineMode && [
          'border-4 md:border-8 border-indigo-500/60',
          'shadow-[0_0_0_2px_rgba(99,102,241,0.25),0_0_40px_rgba(99,102,241,0.15)]',
          'ring-2 ring-indigo-400/30'
        ]
      )}
      style={isTimeMachineMode ? {
        // ⚡ MODE SABLIER: Pattern d'étoiles subtil sur le fond indigo pour effet cosmique
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.15) 1px, transparent 0)',
        backgroundSize: '30px 30px',
      } : undefined}
    >
      {children}
    </div>
  );
}
