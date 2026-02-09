'use client';

import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import clsx from 'clsx';

type Props = {
  children: React.ReactNode;
};

/**
 * Composant qui ajoute un cadre visuel autour de l'application
 * quand on est en mode "sablier" (remonter le temps)
 * Crée une immersion totale avec un cadre qui entoure toute l'app
 */
export function TimeMachineWrapper({ children }: Props) {
  // ⚡ PERFORMANCE: Utiliser isTimeMachineMode directement (déjà calculé dans SelectedDateContext)
  const { isTimeMachineMode } = useSelectedDate();

  return (
    <div className={clsx(
      'relative min-h-screen transition-colors duration-300',
      // ⚡ MODE SABLIER: Fond sable plus visible pour renforcer l'immersion
      isTimeMachineMode ? 'bg-amber-50/50' : 'bg-white'
    )}>
      {/* Cadre qui entoure toute l'application - collé aux bords de la fenêtre */}
      {isTimeMachineMode && (
        <>
          {/* Bordure principale avec effet de glow - collée aux bords */}
          <div
            className={clsx(
              'fixed inset-0 pointer-events-none z-[100]',
              'border-[4px] border-amber-400',
              'shadow-[0_0_30px_rgba(251,191,36,0.4),inset_0_0_30px_rgba(251,191,36,0.15)]',
              'animate-pulse',
              'transition-all duration-300'
            )}
          />
          
          {/* Coins décoratifs renforcés - collés aux bords */}
          <div className="fixed top-0 left-0 w-12 h-12 border-t-[4px] border-l-[4px] border-amber-500 rounded-tl-lg z-[101] pointer-events-none" />
          <div className="fixed top-0 right-0 w-12 h-12 border-t-[4px] border-r-[4px] border-amber-500 rounded-tr-lg z-[101] pointer-events-none" />
          <div className="fixed bottom-0 left-0 w-12 h-12 border-b-[4px] border-l-[4px] border-amber-500 rounded-bl-lg z-[101] pointer-events-none" />
          <div className="fixed bottom-0 right-0 w-12 h-12 border-b-[4px] border-r-[4px] border-amber-500 rounded-br-lg z-[101] pointer-events-none" />
          
          {/* Overlay subtil pour renforcer l'effet - collé aux bords */}
          <div className="fixed inset-0 pointer-events-none z-[99] bg-amber-50/5" />
        </>
      )}
      
      {children}
    </div>
  );
}
