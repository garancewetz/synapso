'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ConfettiRain from '@/app/components/ConfettiRain';
import { ClockIcon, CalendarIcon } from '@/app/components/ui/icons';
import { isMonday } from 'date-fns';
import { useHandPreference } from '@/app/hooks/useHandPreference';
import { cn } from '@/app/utils/cn';

interface WelcomeHeaderProps {
  userName: string;
  completedToday: number | null;
  resetFrequency?: 'DAILY' | 'WEEKLY' | null;
}

// Objectif quotidien : 5 exercices par jour
const DAILY_GOAL = 5;
const CELEBRATION_DURATION_MS = 4800;

const ENCOURAGEMENTS = [
  "Continue comme ça !",
  "Chaque effort compte.",
  "Belle progression !",
  "Tu es sur la bonne voie.",
  "Excellent travail.",
];

const COMPLETION_MESSAGES = [
  { threshold: 0, message: "Prête pour ta séance ?" },
  { threshold: 0.2, message: "Bon début !" },
  { threshold: 0.4, message: "Tu avances bien." },
  { threshold: 0.6, message: "Plus que quelques-uns." },
  { threshold: 0.8, message: "Presque terminé !" },
  { threshold: 1, message: "Objectif atteint !" },
];

// Couleurs et emojis pour les animations
const SPARKLE_COLORS = ['#10b981', '#34d399', '#fbbf24', '#f59e0b', '#8b5cf6'];
const CONFETTI_COLORS = ['#10b981', '#34d399', '#fbbf24', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#ef4444', '#06b6d4'];
const CELEBRATION_EMOJIS = ['🎉', '🎊', '⭐', '💪', '🌟', '✨', '🏆', '💫'];


export default function WelcomeHeader({ userName, completedToday, resetFrequency = null }: WelcomeHeaderProps) {
  const { isLeftHanded } = useHandPreference();
  const [encouragement, setEncouragement] = useState('');
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

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * ENCOURAGEMENTS.length);
    setEncouragement(ENCOURAGEMENTS[randomIndex]);
  }, []);

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

  const getCompletionMessage = () => {
    // Message spécial le lundi pour les utilisateurs en mode hebdomadaire
    if (resetFrequency === 'WEEKLY' && isMonday(new Date())) {
      return "C'est parti pour une nouvelle semaine !";
    }
    
    if (bonusExercices > 0) {
      return `${bonusExercices} exercice${bonusExercices > 1 ? 's' : ''} en bonus !`;
    }
    const matchingMessage = [...COMPLETION_MESSAGES]
      .reverse()
      .find((m) => progress >= m.threshold);
    return matchingMessage?.message || COMPLETION_MESSAGES[0].message;
  };

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
      className={`relative bg-white rounded-2xl shadow-sm border py-5 md:p-6 mb-6 overflow-hidden transition-all duration-500 ${
        isGoalReached ? 'border-emerald-300 shadow-emerald-100' : 'border-gray-200'
      }`}
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

      {/* Greeting */}
      <div className="mb-5 relative z-10 px-3 md:px-4">
        <div className={cn('flex items-start gap-2 justify-between', isLeftHanded && 'flex-row-reverse')}>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-1">
              {getTimeGreeting()}, {userName}
            </h1>
            {/* Badge de réinitialisation - affiché seulement si l'information est chargée */}
            {resetFrequency && (
              <span className={`
                inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium mb-2
                ${resetFrequency === 'DAILY' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-purple-100 text-purple-700'
                }
              `}>
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
            <p className="text-gray-500 text-sm md:text-base mt-1">
              {getCompletionMessage()}
            </p>
          </div>
          <Link
            href="/settings"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex-shrink-0"
            aria-label="Paramètres"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3 relative z-10 px-3 md:px-4">
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
          className="h-2 bg-gray-100 rounded-full overflow-hidden relative"
          role="progressbar"
          aria-valuenow={isLoading ? 0 : count}
          aria-valuemin={0}
          aria-valuemax={DAILY_GOAL}
          aria-label={`Progression : ${isLoading ? 'chargement' : `${count} sur ${DAILY_GOAL} exercices complétés`}`}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 relative overflow-hidden"
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

      {/* Encouragement discret */}
      {!isLoading && count > 0 && !isGoalReached && (
        <p className="text-sm text-gray-500 mt-3 relative z-10 px-3 md:px-4">
          {encouragement}
        </p>
      )}

      {/* Message de succès avec animation */}
      <AnimatePresence>
        {isGoalReached && (
          <motion.div 
            className="mt-4 mx-3 md:mx-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg relative z-10 backdrop-blur-sm"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <p className="text-emerald-700 font-medium text-sm flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                🎉
              </motion.span>
              Objectif quotidien atteint — Bravo !
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
