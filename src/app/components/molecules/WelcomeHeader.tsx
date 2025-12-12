'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeHeaderProps {
  userName: string;
  completedToday: number;
}

// Objectif quotidien : 5 exercices par jour
const DAILY_GOAL = 5;

const ENCOURAGEMENTS = [
  "Tu avances bien, continue !",
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

// Composant Emoji qui tombe avec les confettis
function PopEmoji({ delay, x, emoji }: { delay: number; x: number; emoji: string }) {
  const swayAmount = 20 + Math.random() * 30;
  const swayDirection = Math.random() > 0.5 ? 1 : -1;
  
  return (
    <motion.div
      className="absolute pointer-events-none text-3xl"
      style={{ left: `${x}%`, top: '-10%' }}
      initial={{ opacity: 0, scale: 0, y: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 1, 1, 0.8, 0],
        scale: [0.5, 1.4, 1.3, 1.2, 1.1, 1, 0.8],
        y: [0, 20, 60, 100, 140, 180, 220],
        x: [
          0,
          swayDirection * swayAmount * 0.3,
          swayDirection * swayAmount * 0.8,
          swayDirection * swayAmount * 0.4,
          swayDirection * -swayAmount * 0.3,
          swayDirection * -swayAmount * 0.5,
          swayDirection * -swayAmount * 0.2,
        ],
        rotate: [0, -15, 10, -8, 12, -5, 0],
      }}
      transition={{
        duration: 3.2,
        delay,
        ease: "easeOut",
        times: [0, 0.1, 0.25, 0.45, 0.65, 0.85, 1],
      }}
    >
      {emoji}
    </motion.div>
  );
}

// Composant Confetti amélioré - chute fluide et naturelle, caché avant de tomber
function Confetti({ delay, startX, color, size }: { delay: number; startX: number; color: string; size: number }) {
  const randomRotation = Math.random() * 720;
  const swayAmount = 15 + Math.random() * 25; // Amplitude du balancement
  const swayDirection = Math.random() > 0.5 ? 1 : -1;
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ 
        left: `${startX}%`, 
        top: '-5%',
        width: size,
        height: size * 1.8,
        backgroundColor: color,
        borderRadius: '1px',
      }}
      initial={{ opacity: 0, y: -10, x: 0, rotate: 0, rotateX: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 1, 0.9, 0.7, 0],
        y: [-10, 30, 60, 95, 130, 165, 200],
        x: [
          0, 
          swayDirection * swayAmount * 0.5, 
          swayDirection * swayAmount,
          swayDirection * swayAmount * 0.3,
          swayDirection * -swayAmount * 0.4,
          swayDirection * -swayAmount * 0.6,
          swayDirection * -swayAmount * 0.3,
        ],
        rotate: [0, randomRotation * 0.2, randomRotation * 0.5, randomRotation * 0.7, randomRotation * 0.85, randomRotation],
        rotateX: [0, 45, 90, 135, 180, 225, 270], // Effet de retournement 3D
      }}
      transition={{
        duration: 3.2,
        delay,
        ease: "linear",
        times: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1],
      }}
    />
  );
}

export default function WelcomeHeader({ userName, completedToday }: WelcomeHeaderProps) {
  const [encouragement, setEncouragement] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const prevCompletedRef = useRef(completedToday);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Progression basée sur l'objectif quotidien de 5 exercices
  const progress = Math.min(completedToday / DAILY_GOAL, 1);
  const isGoalReached = completedToday >= DAILY_GOAL;
  const bonusExercices = Math.max(0, completedToday - DAILY_GOAL);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * ENCOURAGEMENTS.length);
    setEncouragement(ENCOURAGEMENTS[randomIndex]);
  }, []);

  // Déclencher la célébration quand l'objectif est atteint
  useEffect(() => {
    const wasGoalReached = prevCompletedRef.current >= DAILY_GOAL;
    const isNowGoalReached = completedToday >= DAILY_GOAL;
    
    // Déclencher seulement si on vient d'atteindre l'objectif
    if (!wasGoalReached && isNowGoalReached) {
      // Scroll fluide vers la carte pour voir la célébration
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Petit délai pour laisser le scroll se faire avant l'animation
      setTimeout(() => {
        setShowCelebration(true);
      }, 300);
      
      // Célébration plus longue pour voir tous les effets
      const timer = setTimeout(() => setShowCelebration(false), 4800);
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
    if (bonusExercices > 0) {
      return `${bonusExercices} exercice${bonusExercices > 1 ? 's' : ''} en bonus !`;
    }
    const matchingMessage = [...COMPLETION_MESSAGES]
      .reverse()
      .find((m) => progress >= m.threshold);
    return matchingMessage?.message || COMPLETION_MESSAGES[0].message;
  };

  // Couleurs festives et joyeuses
  const sparkleColors = ['#10b981', '#34d399', '#fbbf24', '#f59e0b', '#8b5cf6'];
  const confettiColors = ['#10b981', '#34d399', '#fbbf24', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#ef4444', '#06b6d4'];
  const emojis = ['🎉', '🎊', '⭐', '💪', '🌟', '✨', '🏆', '💫'];

  // Générer les emojis qui tombent avec les confettis
  const popEmojis = Array.from({ length: 7 }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    delay: 0.1 + i * 0.15 + Math.random() * 0.2,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
  }));

  // Générer les confettis qui tombent - apparition étalée pour plus de fluidité
  const confettis = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    startX: 5 + Math.random() * 90,
    delay: (i * 0.04) + Math.random() * 0.3, // Apparition progressive et naturelle
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    size: 5 + Math.random() * 5,
  }));

  return (
    <div 
      ref={cardRef}
      className={`relative bg-white rounded-2xl shadow-sm border p-5 md:p-6 mx-4 mb-6 overflow-hidden transition-all duration-500 ${
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

      {/* 🎊 Pluie de confettis et emojis 🎊 */}
      <AnimatePresence>
        {showCelebration && (
          <>
            {/* Emojis qui tombent */}
            {popEmojis.map((emoji) => (
              <PopEmoji
                key={`emoji-${emoji.id}`}
                delay={emoji.delay}
                x={emoji.x}
                emoji={emoji.emoji}
              />
            ))}
            
            {/* Confettis qui tombent */}
            {confettis.map((confetti) => (
              <Confetti
                key={`confetti-${confetti.id}`}
                delay={confetti.delay}
                startX={confetti.startX}
                color={confetti.color}
                size={confetti.size}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Paillettes continues quand objectif atteint */}
      {isGoalReached && !showCelebration && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`ambient-sparkle-${i}`}
              className="absolute"
              style={{ 
                left: `${15 + i * 18}%`, 
                top: `${20 + (i % 3) * 25}%` 
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.1, 0.8],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut",
              }}
            >
              <svg 
                width={8 + i * 2} 
                height={8 + i * 2} 
                viewBox="0 0 24 24" 
                fill={sparkleColors[i % sparkleColors.length]}
                className="opacity-60"
              >
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </motion.div>
          ))}
        </div>
      )}

      {/* Greeting */}
      <div className="mb-5 relative z-10">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
          {getTimeGreeting()}, {userName}
        </h1>
        <p className="text-gray-500 text-sm md:text-base mt-1">
          {getCompletionMessage()}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-3 relative z-10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Objectif du jour
          </span>
          <span className="text-sm font-semibold text-gray-700">
            {completedToday} / {DAILY_GOAL}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>
        {/* Indicateurs discrets */}
        <div className="flex justify-between mt-1.5 px-0.5">
          {[1, 2, 3, 4, 5].map((step) => (
            <motion.div 
              key={step}
              className={`w-1.5 h-1.5 rounded-full ${
                completedToday >= step ? 'bg-emerald-400' : 'bg-gray-200'
              }`}
              animate={completedToday >= step ? {
                scale: [1, 1.3, 1],
              } : {}}
              transition={{ duration: 0.3, delay: step * 0.1 }}
            />
          ))}
        </div>
      </div>

      {/* Encouragement discret */}
      {completedToday > 0 && !isGoalReached && (
        <p className="text-sm text-gray-500 mt-3 relative z-10">
          {encouragement}
        </p>
      )}

      {/* Message de succès avec animation */}
      <AnimatePresence>
        {isGoalReached && (
          <motion.div 
            className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg relative z-10"
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
