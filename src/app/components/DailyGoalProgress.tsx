'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

const DAILY_GOAL = 5;

type Props = {
  completedToday: number | null;
};

export function DailyGoalProgress({ completedToday }: Props) {
  const isLoading = completedToday === null;
  const count = completedToday ?? 0;
  const progress = isLoading ? 0 : Math.min(count / DAILY_GOAL, 1);
  const isGoalReached = !isLoading && count >= DAILY_GOAL;
  const bonusExercices = isLoading ? 0 : Math.max(0, count - DAILY_GOAL);

  return (
    <div className="mb-4 relative z-10 px-3 md:px-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Objectif du jour
        </span>
        <span className="text-sm font-semibold text-gray-700" aria-live="polite" aria-atomic="true">
          {isLoading ? '...' : `${count} / ${DAILY_GOAL}`}
          {!isLoading && bonusExercices > 0 && (
            <span className="text-emerald-600 ml-1" aria-label={`${bonusExercices} exercices bonus`}>+{bonusExercices}</span>
          )}
        </span>
      </div>
      <div 
        className="h-2.5 bg-gray-100 rounded-full overflow-hidden relative"
        role="progressbar"
        aria-valuenow={isLoading ? 0 : count}
        aria-valuemin={0}
        aria-valuemax={DAILY_GOAL}
        aria-label={`Progression : ${isLoading ? 'chargement' : `${count} sur ${DAILY_GOAL} exercices complétés`}`}
      >
        <motion.div
          className={clsx(
            "h-full rounded-full relative overflow-hidden",
            isGoalReached 
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600" 
              : "bg-gradient-to-r from-teal-400 to-emerald-500"
          )}
          initial={{ width: '0%' }}
          animate={{ 
            width: isLoading ? '0%' : `${progress * 100}%`,
          }}
          transition={{ 
            duration: isLoading ? 0 : 0.5, 
            ease: "easeOut" 
          }}
        />
        {/* Indicateur de dépassement visuel pour les exercices bonus */}
        {bonusExercices > 0 && (
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 opacity-60"
            style={{ width: `${Math.min((bonusExercices / DAILY_GOAL) * 100, 100)}%` }}
            animate={{ 
              x: `${progress * 100}%`,
            }}
            transition={{ 
              duration: 0.5, 
              ease: "easeOut",
            }}
          />
        )}
      </div>
    </div>
  );
}

