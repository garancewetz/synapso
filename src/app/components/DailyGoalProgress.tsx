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
        aria-valuenow={isLoading ? 0 : Math.min(count, DAILY_GOAL)}
        aria-valuemin={0}
        aria-valuemax={DAILY_GOAL}
        aria-label={`Progression : ${isLoading ? 'chargement' : `${Math.min(count, DAILY_GOAL)} sur ${DAILY_GOAL} exercices complétés${bonusExercices > 0 ? ` (+${bonusExercices} bonus)` : ''}`}`}
      >
        <motion.div
          className={clsx(
            "h-full rounded-full relative",
            isGoalReached 
              ? "bg-linear-to-r from-emerald-500 to-emerald-600" 
              : "bg-linear-to-r from-teal-400 to-emerald-500"
          )}
          initial={{ width: '0%' }}
          animate={{ 
            width: isLoading ? '0%' : `${progress * 100}%`,
            boxShadow: bonusExercices > 0 
              ? ['0 0 8px rgba(16, 185, 129, 0.4)', '0 0 12px rgba(16, 185, 129, 0.6)', '0 0 8px rgba(16, 185, 129, 0.4)']
              : '0 0 0px rgba(16, 185, 129, 0)'
          }}
          transition={{ 
            width: { duration: isLoading ? 0 : 0.5, ease: "easeOut" },
            boxShadow: { duration: 1.5, repeat: bonusExercices > 0 ? Infinity : 0, ease: "easeInOut" }
          }}
        />
      </div>
    </div>
  );
}

