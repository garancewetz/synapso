'use client';

import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import { CheckIcon, SparklesIcon } from '@/app/components/ui/icons';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  isCompleted: boolean;
  isCompletedToday?: boolean;
  isLoading?: boolean;
  variant?: 'exercice' | 'challenge';
  weeklyCount?: number; // Nombre de fois fait cette semaine
  resetFrequency?: 'DAILY' | 'WEEKLY'; // Mode de réinitialisation
};

export function CompleteButton({ 
  isCompleted, 
  isCompletedToday = false,
  isLoading = false,
  variant = 'exercice',
  weeklyCount = 0,
  resetFrequency = 'DAILY',
  className = '',
  ...props 
}: Props) {
  const getLabel = (): React.ReactNode => {
    if (variant === 'challenge') {
      return isCompleted ? 'Maîtrisé' : 'Marquer maîtrisé';
    }
    
    if (isCompleted) {
      // En mode hebdomadaire, toujours afficher "Fait aujourd'hui" si complété
      if (resetFrequency === 'WEEKLY') {
        return isCompletedToday ? 'Fait aujourd\'hui' : 'Fait aujourd\'hui';
      }
      // En mode quotidien, afficher le compteur si fait plusieurs fois
      if (weeklyCount > 1) {
        return `Fait (${weeklyCount}× cette semaine)`;
      }
      return isCompletedToday ? 'Fait' : 'Fait cette semaine';
    }
    // Quand pas complété, toujours "Fait aujourd'hui"
    return 'Fait aujourd\'hui';
  };

  const getTitle = () => {
    if (variant === 'challenge') {
      return isCompleted ? 'Annuler maîtrise' : 'Marquer comme maîtrisé';
    }
    
    if (isCompleted) {
      return isCompletedToday ? 'Démarquer' : 'Fait cette semaine - Démarquer';
    }
    return 'Marquer comme fait aujourd\'hui';
  };

  const getStyles = () => {
    if (variant === 'challenge') {
      if (isCompleted) {
        return 'bg-emerald-500 text-white hover:bg-emerald-600';
      }
      return 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 hover:border-gray-400';
    }
    
    if (isCompleted) {
      return isCompletedToday
        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
        : 'bg-emerald-400 text-white hover:bg-emerald-500';
    }
    return 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 hover:border-gray-400';
  };

  const getIcon = () => {
    if (variant === 'challenge') {
      return <SparklesIcon className="w-4 h-4" />;
    }
    return <CheckIcon className="w-4 h-4" />;
  };

  return (
    <button
      className={clsx(
        'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
        'font-semibold text-sm transition-all duration-200 shadow-sm whitespace-nowrap',
        getStyles(),
        className
      )}
      title={getTitle()}
      aria-label={isCompleted ? (variant === 'challenge' ? 'Annuler maîtrise' : 'Démarquer') : (variant === 'challenge' ? 'Marquer comme maîtrisé' : 'Marquer comme fait')}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <>
          {getIcon()}
          {getLabel()}
        </>
      )}
    </button>
  );
}

