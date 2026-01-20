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
};

export function CompleteButton({ 
  isCompleted, 
  isCompletedToday = false,
  isLoading = false,
  variant = 'exercice',
  weeklyCount = 0,
  className = '',
  ...props 
}: Props) {
  const getLabel = (): React.ReactNode => {
    if (variant === 'challenge') {
      return isCompleted ? 'Maîtrisé' : 'Marquer maîtrisé';
    }
    
    // Afficher le compteur hebdomadaire si fait plusieurs fois cette semaine
    if (weeklyCount > 1) {
      return `Fait (${weeklyCount}× cette semaine)`;
    }
    
    // Sinon, toujours "Fait aujourd'hui" (le style indique si c'est fait aujourd'hui ou non)
    return 'Fait aujourd\'hui';
  };

  const getTitle = () => {
    if (variant === 'challenge') {
      return isCompleted ? 'Annuler maîtrise' : 'Marquer comme maîtrisé';
    }
    
    if (isCompletedToday) {
      return 'Démarquer';
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
    
    // Pour les exercices : vert uniquement si fait aujourd'hui, sinon gris
    if (isCompletedToday) {
      return '!bg-emerald-500 text-white hover:bg-emerald-600 border-0';
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
      size="sm"
      rounded="lg"
      className={clsx(
        'flex-1 whitespace-nowrap shadow-sm font-semibold text-sm',
        getCustomStyles(),
        className
      )}
      title={getTitle()}
      aria-label={isCompletedToday ? (variant === 'challenge' ? 'Annuler maîtrise' : 'Démarquer') : (variant === 'challenge' ? 'Marquer comme maîtrisé' : 'Marquer comme fait aujourd\'hui')}
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

