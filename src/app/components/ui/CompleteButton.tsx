'use client';

import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import { CheckIcon, SparklesIcon } from '@/app/components/ui/icons';
import { Button } from './Button';

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
      return isCompletedToday ? 'Fait aujourd\'hui' : 'Fait cette semaine';
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

  const getCustomStyles = () => {
    if (variant === 'challenge') {
      if (isCompleted) {
        return 'bg-emerald-500 text-white hover:bg-emerald-600 border-0';
      }
      return 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 hover:border-gray-400';
    }
    
    if (isCompleted) {
      return isCompletedToday
        ? '!bg-emerald-500 text-white hover:bg-emerald-600 border-0'
        : 'bg-emerald-400 text-white hover:bg-emerald-500 border-0';
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
    <Button
      variant="secondary"
      icon={isLoading ? undefined : getIcon()}
      size="md"
      rounded="lg"
      className={clsx(
        'flex-1 whitespace-nowrap shadow-sm font-semibold text-sm',
        getCustomStyles(),
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
        getLabel()
      )}
    </Button>
  );
}

