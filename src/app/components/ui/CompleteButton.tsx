'use client';

import { ButtonHTMLAttributes } from 'react';
import { CheckIcon } from '@/app/components/ui/icons';

interface CompleteButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  isCompleted: boolean;
  isCompletedToday: boolean;
  isLoading?: boolean;
}

export function CompleteButton({ 
  isCompleted, 
  isCompletedToday,
  isLoading = false,
  className = '',
  ...props 
}: CompleteButtonProps) {
  const getLabel = () => {
    if (isCompleted) {
      return isCompletedToday ? 'Fait' : 'Fait cette semaine';
    }
    return 'Marquer fait';
  };

  const getTitle = () => {
    if (isCompleted) {
      return isCompletedToday ? 'Démarquer' : 'Fait cette semaine - Démarquer';
    }
    return 'Marquer comme fait';
  };

  const getStyles = () => {
    if (isCompleted) {
      return isCompletedToday
        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
        : 'bg-emerald-400 text-white hover:bg-emerald-500';
    }
    return 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 hover:border-gray-400';
  };

  return (
    <button
      className={`
        flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
        font-semibold text-sm transition-all duration-200 shadow-sm
        ${getStyles()}
        ${className}
      `}
      title={getTitle()}
      aria-label={isCompleted ? 'Démarquer' : 'Marquer comme fait'}
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
          <CheckIcon className="w-4 h-4" />
          <span>{getLabel()}</span>
        </>
      )}
    </button>
  );
}

