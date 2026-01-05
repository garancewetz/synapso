'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ConfettiRain from '@/app/components/ConfettiRain';
import { ClockIcon, CalendarIcon } from '@/app/components/ui/icons';
import { isToday, isYesterday, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useHandPreference } from '@/app/hooks/useHandPreference';
import { ActivityHeatmapCell } from '@/app/components/historique/ActivityHeatmapCell';
import type { HeatmapDay } from '@/app/utils/historique.utils';
import clsx from 'clsx';

type Props = {
  userName: string;
  completedToday: number | null;
  resetFrequency?: 'DAILY' | 'WEEKLY' | null;
  weekData?: HeatmapDay[];
  victoryDates?: Set<string>;
  onDayClick?: (day: HeatmapDay) => void;
};

// Objectif quotidien : 5 exercices par jour
const DAILY_GOAL = 5;
const CELEBRATION_DURATION_MS = 4800;

// Noms des jours de la semaine (lundi = début) - pour rythme hebdomadaire
const WEEKDAY_NAMES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Génère les labels pour les 7 derniers jours (rythme quotidien)
function getDailyLabels(days: HeatmapDay[]): string[] {
  return days.map((day) => {
    if (!day.date) return '';
    
    if (isToday(day.date)) {
      return 'Auj.';
    }
    if (isYesterday(day.date)) {
      return 'Hier';
    }
    // Pour les jours précédents, afficher le jour de la semaine court
    return format(day.date, 'EEE', { locale: fr }).substring(0, 3);
  });
}

// Couleurs et emojis pour les animations
const SPARKLE_COLORS = ['#10b981', '#34d399', '#fbbf24', '#f59e0b', '#8b5cf6'];
const CONFETTI_COLORS = ['#10b981', '#34d399', '#fbbf24', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#ef4444', '#06b6d4'];
const CELEBRATION_EMOJIS = ['🎉', '🎊', '⭐', '💪', '🌟', '✨', '🏆', '💫'];


export default function WelcomeHeader({ userName, completedToday, resetFrequency = null, weekData, victoryDates, onDayClick }: Props) {
  const { isLeftHanded } = useHandPreference();
  const [showCelebration, setShowCelebration] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const prevCompletedRef = useRef(completedToday);
  const isAnimatingRef = useRef(false);
  
  // Progression basée sur l'objectif quotidien de 5 exercices
  const isLoading = completedToday === null;
  const count = completedToday ?? 0;
  const progress = isLoading ? 0 : Math.min(count / DAILY_GOAL, 1);
  const isGoalReached = !isLoading && count >= DAILY_GOAL;
  const bonusExercices = isLoading ? 0 : Math.max(0, count - DAILY_GOAL);

  // Déclencher les confettis uniquement quand on atteint exactement 5/5 (sans bonus)
  useEffect(() => {
    const prevCompleted = prevCompletedRef.current;
    
    // Ignorer si on charge ou si une animation est en cours
    if (completedToday === null || isAnimatingRef.current) {
      if (completedToday !== null) {
        prevCompletedRef.current = completedToday;
      }
      return;
    }
    
    // Ignorer si pas de changement ou régression
    if (prevCompleted === completedToday || (prevCompleted !== null && completedToday < prevCompleted)) {
      prevCompletedRef.current = completedToday;
      return;
    }
    
    // Déclencher uniquement quand on passe de moins de 5 à exactement 5
    const wasBelowGoal = prevCompleted !== null && prevCompleted < DAILY_GOAL;
    const isExactlyGoal = completedToday === DAILY_GOAL;
    
    if (wasBelowGoal && isExactlyGoal) {
      isAnimatingRef.current = true;
      prevCompletedRef.current = completedToday;
      
      setAnimationKey(prev => prev + 1);
      setShowCelebration(true);
      
      const timer = setTimeout(() => {
        setShowCelebration(false);
        isAnimatingRef.current = false;
      }, CELEBRATION_DURATION_MS);
      
      return () => clearTimeout(timer);
    }
    
    prevCompletedRef.current = completedToday;
  }, [completedToday]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  // Labels pour le calendrier de la semaine
  const weekLabels = useMemo(() => {
    if (!weekData || weekData.length !== 7) return [];
    return resetFrequency === 'DAILY' 
      ? getDailyLabels(weekData)
      : WEEKDAY_NAMES;
  }, [weekData, resetFrequency]);

  // Mémoriser les paillettes pour éviter qu'elles se régénèrent à chaque render
  // Elles apparaissent seulement quand l'objectif est atteint (5/5 ou plus)
  const sparkles = useMemo(() => {
    if (!isGoalReached) return [];
    return Array.from({ length: 5 }, (_, i) => ({
      id: `sparkle-${i}`,
      left: `${15 + i * 18}%`,
      top: `${20 + (i % 3) * 25}%`,
      width: 8 + i * 2,
      height: 8 + i * 2,
      color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
      duration: 2 + i * 0.3,
      delay: i * 0.4,
    }));
  }, [isGoalReached]);

  return (
    <div 
      className={clsx(
        'relative bg-white rounded-2xl shadow-sm border py-5 md:p-6 mb-6 overflow-hidden transition-all duration-500',
        isGoalReached ? 'border-emerald-300 shadow-emerald-100' : 'border-gray-200'
      )}
    >
      
      {/* Effet de brillance sur la bordure quand objectif atteint */}
      {isGoalReached && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.1), transparent)',
            backgroundSize: '200% 100%',
          }}
        />
      )}

      {/* Confettis : déclenchés uniquement quand on atteint exactement 5/5 */}
      <ConfettiRain
        key={animationKey}
        show={showCelebration}
        fromWindow={true}
        emojiCount={7}
        confettiCount={40}
        emojis={CELEBRATION_EMOJIS}
        colors={CONFETTI_COLORS}
      />


      {/* Paillettes continues quand objectif atteint (5/5 ou plus) - restent visibles même pendant l'animation */}
      {sparkles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              className="absolute"
              style={{ 
                left: sparkle.left, 
                top: sparkle.top 
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.1, 0.8],
              }}
              transition={{
                duration: sparkle.duration,
                repeat: Infinity,
                delay: sparkle.delay,
                ease: "easeInOut",
              }}
            >
              <svg 
                width={sparkle.width} 
                height={sparkle.height} 
                viewBox="0 0 24 24" 
                fill={sparkle.color}
                className="opacity-60"
              >
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </motion.div>
          ))}
        </div>
      )}

      {/* Ligne 1 : Greeting + Paramètres */}
      <div className="mb-4 relative z-10 px-3 md:px-4">
        <div className={clsx('flex items-start gap-2 justify-between', isLeftHanded && 'flex-row-reverse')}>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-1">
              {getTimeGreeting()}, {userName}
            </h1>
            {/* Badge de réinitialisation - affiché seulement si l'information est chargée */}
            {resetFrequency && (
              <span className={clsx(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium',
                resetFrequency === 'DAILY' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-purple-100 text-purple-700'
              )}>
                {resetFrequency === 'DAILY' ? (
                  <>
                    <ClockIcon className="w-3 h-3" />
                    Rythme quotidien
                  </>
                ) : (
                  <>
                    <CalendarIcon className="w-3 h-3" />
                    Rythme hebdomadaire
                  </>
                )}
              </span>
            )}
          </div>
          <Link
            href="/settings"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors shrink-0"
            aria-label="Mon profil"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Ligne 2 : Jauge du jour (Priorité 1) */}
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

      {/* Ligne 3 : Calendrier de la semaine */}
      {weekData && weekData.length === 7 && (
        <div className="relative z-10 px-3 md:px-4">
          {/* En-têtes des jours */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekLabels.map((label, index) => {
              const isWeekend = resetFrequency === 'WEEKLY' && index >= 5;
              const isTodayLabel = resetFrequency === 'DAILY' && index === 6;
              const isHighlighted = isWeekend || isTodayLabel;
              
              return (
                <div 
                  key={`day-label-${index}`}
                  className={clsx(
                    'text-center text-xs font-semibold flex items-center justify-center',
                    isHighlighted ? 'text-emerald-600' : 'text-gray-500'
                  )}
                >
                  {label}
                </div>
              );
            })}
          </div>

          {/* Grille des jours */}
          <div className="grid grid-cols-7 gap-2">
            {weekData.map((day) => (
              <ActivityHeatmapCell
                key={day.dateKey}
                day={day}
                victoryDates={victoryDates}
                onDayClick={onDayClick}
                showDate={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
