'use client';

import { useState, useEffect } from 'react';

interface WelcomeHeaderProps {
  userName: string;
  totalExercices: number;
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

export default function WelcomeHeader({ userName, completedToday }: WelcomeHeaderProps) {
  const [encouragement, setEncouragement] = useState('');
  
  // Progression basée sur l'objectif quotidien de 5 exercices
  const progress = Math.min(completedToday / DAILY_GOAL, 1);
  const isGoalReached = completedToday >= DAILY_GOAL;
  const bonusExercices = Math.max(0, completedToday - DAILY_GOAL);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * ENCOURAGEMENTS.length);
    setEncouragement(ENCOURAGEMENTS[randomIndex]);
  }, []);

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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6 mx-4 mb-6">
      {/* Greeting */}
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
          {getTimeGreeting()}, {userName}
        </h1>
        <p className="text-gray-500 text-sm md:text-base mt-1">
          {getCompletionMessage()}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Objectif du jour
          </span>
          <span className="text-sm font-semibold text-gray-700">
            {completedToday} / {DAILY_GOAL}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-teal-400 to-emerald-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        {/* Indicateurs discrets */}
        <div className="flex justify-between mt-1.5 px-0.5">
          {[1, 2, 3, 4, 5].map((step) => (
            <div 
              key={step}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                completedToday >= step ? 'bg-emerald-400' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Encouragement discret */}
      {completedToday > 0 && !isGoalReached && (
        <p className="text-sm text-gray-500 mt-3">
          {encouragement}
        </p>
      )}

      {/* Message de succès sobre */}
      {isGoalReached && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-emerald-700 font-medium text-sm">
            Objectif quotidien atteint — Bravo !
          </p>
        </div>
      )}
    </div>
  );
}
