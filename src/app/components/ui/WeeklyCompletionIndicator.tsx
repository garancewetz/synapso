'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { isSameDay, startOfWeek, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

type Props = {
  completions: Date[];
  className?: string;
};

// Jours de la semaine (Lundi à Dimanche)
const WEEK_DAYS = [
  { label: 'L', shortName: 'L', fullName: 'Lundi', dayIndex: 1 },
  { label: 'M', shortName: 'Mar', fullName: 'Mardi', dayIndex: 2 },
  { label: 'M', shortName: 'Mer', fullName: 'Mercredi', dayIndex: 3 },
  { label: 'J', shortName: 'J', fullName: 'Jeudi', dayIndex: 4 },
  { label: 'V', shortName: 'V', fullName: 'Vendredi', dayIndex: 5 },
  { label: 'S', shortName: 'S', fullName: 'Samedi', dayIndex: 6 },
  { label: 'D', shortName: 'D', fullName: 'Dimanche', dayIndex: 0 },
];

export function WeeklyCompletionIndicator({ completions, className }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermer le tooltip au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Calculer les jours de la semaine avec leur statut
  const { weekDays, totalCount } = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });

    // Dédupliquer les dates complétées pour l'affichage du calendrier
    const completedDates = new Set<string>();
    completions.forEach(completion => {
      const date = new Date(completion);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      completedDates.add(dateKey);
    });

    // Créer les 7 jours de la semaine
    const days = WEEK_DAYS.map((dayInfo, index) => {
      const date = addDays(weekStart, index);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const isCompleted = completedDates.has(dateKey);
      const isToday = isSameDay(date, now);

      return {
        ...dayInfo,
        date,
        isCompleted,
        isToday,
      };
    });

    // Compter le nombre TOTAL de validations (pas dédupliqué)
    return {
      weekDays: days,
      totalCount: completions.length,
    };
  }, [completions]);

  const hasToday = weekDays.some(d => d.isToday && d.isCompleted);

  if (totalCount === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      {/* Badge cliquable */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={clsx(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold',
          'transition-all duration-200',
          'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm ring-2 ring-emerald-400 ring-offset-1'
        )}
        title="Cliquez pour voir le calendrier de la semaine"
        aria-label={`Fait ${totalCount} fois cette semaine`}
      >
        {/* Icône */}
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          {hasToday ? (
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          ) : (
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          )}
        </svg>
        <span>Fait {totalCount}×</span>
      </button>

      {/* Tooltip calendrier */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3">
              {/* Titre */}
              <p className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wide text-center">
                Cette semaine
              </p>

              {/* Calendrier L M M J V S D */}
              <div className="flex items-center gap-1.5">
                {weekDays.map((day) => (
                  <motion.div
                    key={day.dayIndex}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: day.dayIndex * 0.05 }}
                    className={clsx(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                      'transition-colors duration-200',
                      day.isCompleted
                        ? day.isToday
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-400',
                      day.isToday && 'ring-2 ring-blue-400 ring-offset-1'
                    )}
                    title={day.fullName}
                  >
                    {day.label}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

