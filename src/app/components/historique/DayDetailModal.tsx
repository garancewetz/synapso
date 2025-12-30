'use client';

import { useState, useEffect } from 'react';
import type { Victory } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/app/constants/exercice.constants';
import { VICTORY_DISPLAY_COLORS } from '@/app/constants/victory.constants';
import { formatShortDate, formatTime } from '@/app/utils/date.utils';
import { useBodyScrollLock } from '@/app/hooks/useBodyScrollLock';
import { VictoryCard } from './VictoryCard';

interface DayExercise {
  name: string;
  category: ExerciceCategory;
  completedAt: string;
}

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  exercises: DayExercise[];
  victory: Victory | null;
}

/**
 * Modale affichant le détail d'une journée du parcours
 * Design adapté aux personnes AVC : gros textes, couleurs contrastées, structure claire
 */
export function DayDetailModal({ isOpen, onClose, date, exercises, victory }: DayDetailModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Bloquer le scroll du body quand la modale est ouverte
  useBodyScrollLock(isOpen);

  // Animation d'ouverture
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !date) return null;

  const formattedDate = formatShortDate(date);

  // Grouper les exercices par catégorie
  const exercisesByCategory = exercises.reduce((acc, exercise) => {
    if (!acc[exercise.category]) {
      acc[exercise.category] = [];
    }
    acc[exercise.category].push(exercise);
    return acc;
  }, {} as Record<ExerciceCategory, DayExercise[]>);

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center
                  transition-colors duration-200
                  ${isVisible && !isClosing ? 'bg-black/50' : 'bg-black/0'}`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col
                    transform transition-transform duration-300 ease-out
                    ${isVisible && !isClosing ? 'translate-y-0 sm:scale-100' : 'translate-y-full sm:translate-y-0 sm:scale-95'}`}
      >
        
        {/* Header simplifié - Grande date lisible */}
        <div className="bg-gray-50 px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{formattedDate}</h2>
              <div className="flex items-center gap-3 mt-2">
                {exercises.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                    ✓ {exercises.length} exercice{exercises.length > 1 ? 's' : ''}
                  </span>
                )}
                {victory && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold">
                    🌟 Victoire
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50/50">
          
          {/* Section Victoire - Mise en avant */}
          {victory && (
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 border-2 border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🌟</span>
                <h3 className="text-lg font-bold text-amber-800">Ta victoire !</h3>
              </div>
              <VictoryCard victory={victory} />
            </div>
          )}

          {/* Section Exercices - Groupés par catégorie avec couleurs */}
          {exercises.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(exercisesByCategory).map(([category, categoryExercises]) => {
                const colors = VICTORY_DISPLAY_COLORS[category as ExerciceCategory];
                
                return (
                  <div 
                    key={category} 
                    className={`rounded-2xl border-2 overflow-hidden ${colors.border}`}
                  >
                    {/* En-tête de catégorie - Très visible */}
                    <div className={`${colors.bg} px-4 py-3 flex items-center gap-3`}>
                      <span className="text-3xl">{CATEGORY_ICONS[category as ExerciceCategory]}</span>
                      <div>
                        <h3 className={`text-lg font-bold ${colors.text}`}>
                          {CATEGORY_LABELS[category as ExerciceCategory]}
                        </h3>
                        <p className={`text-sm ${colors.text} opacity-75`}>
                          {categoryExercises.length} exercice{categoryExercises.length > 1 ? 's' : ''} fait{categoryExercises.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    {/* Liste des exercices */}
                    <div className="bg-white divide-y divide-gray-100">
                      {categoryExercises.map((exercise, index) => (
                        <div
                          key={`${exercise.name}-${index}`}
                          className="flex items-center gap-3 px-4 py-3"
                        >
                          {/* Barre de couleur */}
                          <div className={`w-1.5 h-10 rounded-full ${colors.accent}`} />
                          
                          {/* Nom de l'exercice - Plus gros */}
                          <span className="text-base font-medium text-gray-800 flex-1">
                            {exercise.name}
                          </span>
                          
                          {/* Heure */}
                          <span className="text-sm text-gray-400">
                            {formatTime(exercise.completedAt)}
                          </span>
                          
                          {/* Check visible */}
                          <span className="text-xl text-emerald-500">✓</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !victory && (
            <div className="text-center py-8 bg-white rounded-2xl border border-gray-200">
              <span className="text-4xl mb-3 block">📋</span>
              <p className="text-gray-600 text-lg font-medium">Rien ce jour-là</p>
              <p className="text-gray-400 text-sm mt-1">C&apos;est ok, chaque jour est différent !</p>
            </div>
          )}
        </div>

        {/* Footer - Gros bouton accessible */}
        <div className="px-5 py-4 bg-white border-t border-gray-200">
          <button
            onClick={handleClose}
            className="w-full py-4 px-4 rounded-2xl font-bold text-lg text-gray-700
                       bg-gray-100 hover:bg-gray-200 active:bg-gray-300
                       transition-all active:scale-[0.98]"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
