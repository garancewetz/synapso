'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Exercice } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_ICONS } from '@/app/constants/exercice.constants';
import { useUser } from '@/contexts/UserContext';
import { triggerCompletedCountRefresh } from '@/hooks/useTodayCompletedCount';

interface ExerciceCardProps {
    exercice: Exercice;
    onEdit?: (id: number) => void;
    onCompleted?: (updatedExercice: Exercice) => void;
    showCategory?: boolean; // Masquer le badge catégorie si déjà dans une section
}

export default function ExerciceCard({ exercice, onEdit, onCompleted, showCategory = true }: ExerciceCardProps) {
    const [isCompleting, setIsCompleting] = useState(false);
    const [isPinning, setIsPinning] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { currentUser } = useUser();

    const categoryStyle = CATEGORY_COLORS[exercice.category];

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onEdit) {
            onEdit(exercice.id);
        }
    };

    const handleComplete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUser) return;

        setIsCompleting(true);
        try {
            const response = await fetch(`/api/exercices/${exercice.id}/complete?userId=${currentUser.id}`, {
                method: 'PATCH',
            });

            if (response.ok) {
                const data = await response.json();
                const wasCompleted = exercice.completed;
                // Créer l'exercice mis à jour localement avec les nouvelles valeurs
                const updatedExercice: Exercice = {
                    ...exercice,
                    completed: data.completed,
                    completedToday: data.completedToday ?? false,
                    completedAt: data.completedAt ? new Date(data.completedAt) : null,
                };
                if (!wasCompleted && updatedExercice.completed) {
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 1500);
                }
                if (onCompleted) {
                    onCompleted(updatedExercice);
                }
                // Déclencher le rafraîchissement du compteur
                triggerCompletedCountRefresh();
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
        } finally {
            setIsCompleting(false);
        }
    };

    const handlePin = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUser) return;

        setIsPinning(true);
        try {
            const response = await fetch(`/api/exercices/${exercice.id}/pin?userId=${currentUser.id}`, {
                method: 'PATCH',
            });

            if (response.ok) {
                const data = await response.json();
                // Créer l'exercice mis à jour localement avec le nouveau statut pinned
                const updatedExercice: Exercice = {
                    ...exercice,
                    pinned: data.pinned,
                };
                if (onCompleted) {
                    onCompleted(updatedExercice);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du pin:', error);
        } finally {
            setIsPinning(false);
        }
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const getDayName = (date: Date | string | null): string => {
        if (!date) return 'Cette semaine';
        
        // Convertir en Date si c'est une string
        const completedDate = date instanceof Date ? date : new Date(date);
        
        // Vérifier si la date est valide
        if (isNaN(completedDate.getTime())) {
            return 'Cette semaine';
        }
        
        const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        const dayIndex = completedDate.getDay();
        const dayName = dayNames[dayIndex];
        
        // Capitaliser la première lettre
        return dayName.charAt(0).toUpperCase() + dayName.slice(1);
    };

    return (
        <div 
            className={`
                exercise-card bg-white rounded-xl shadow-sm border overflow-hidden cursor-pointer
                transition-all duration-200
                border-gray-200 hover:shadow-md hover:border-gray-300
                ${showSuccess ? 'success-animation' : ''}
            `}
            onClick={toggleExpand}
            aria-expanded={isExpanded}
        >
            {/* Indicateur de catégorie - barre latérale */}
            <div className={`flex`}>
                <div className={`w-1.5 ${categoryStyle.accent}`} />
                
                <div className="flex-1">
                    {/* Header avec titre */}
                    <div className="p-4 md:p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0 flex items-start gap-2.5">
                                {/* Emoji de catégorie - affiché seulement si showCategory */}
                                {showCategory && (
                                    <span className="flex-shrink-0 text-2xl" role="img" aria-label={CATEGORY_LABELS[exercice.category]}>
                                        {CATEGORY_ICONS[exercice.category]}
                                    </span>
                                )}
                                <div className="flex-1 min-w-0">
                                    {/* Label catégorie - affiché seulement si showCategory */}
                                    {showCategory && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-medium uppercase tracking-wide ${categoryStyle.text}`}>
                                                {CATEGORY_LABELS[exercice.category]}
                                            </span>
                                            {exercice.pinned && (
                                                <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                </svg>
                                            )}
                                        </div>
                                    )}
                                    {/* Icône épinglé si pas de catégorie affichée */}
                                    {!showCategory && exercice.pinned && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                            </svg>
                                        </div>
                                    )}
                                    <h3 className="text-base md:text-lg font-semibold text-gray-900 leading-tight">
                                        {exercice.name}
                                    </h3>
                                </div>
                            </div>

                            {/* Badge complété */}
                            {exercice.completed && (
                                <span className={`
                                    flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1
                                    ${exercice.completedToday 
                                        ? 'bg-emerald-500 text-white' 
                                        : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                    }
                                `}>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {exercice.completedToday ? 'Fait' : getDayName(exercice.completedAt)}
                                </span>
                            )}
                        </div>

                        {/* Tags : bodyparts, workout, équipements */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {/* Bodyparts - couleur pâle de la catégorie */}
                            {exercice.bodyparts && exercice.bodyparts.length > 0 &&
                                exercice.bodyparts.map((bodypart, index) => (
                                    <span
                                        key={`bp-${index}`}
                                        className={`text-xs px-2.5 py-1 rounded-md font-medium ${categoryStyle.tag}`}
                                    >
                                        {bodypart}
                                    </span>
                                ))
                            }
                            {/* Séries */}
                            {exercice.workout.series && exercice.workout.series !== '1' && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium">
                                    {exercice.workout.series} séries
                                </span>
                            )}
                            {/* Répétitions */}
                            {exercice.workout.repeat && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium">
                                    {exercice.workout.repeat}x
                                </span>
                            )}
                            {/* Durée */}
                            {exercice.workout.duration && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium">
                                    {exercice.workout.duration}
                                </span>
                            )}
                            {/* Équipements */}
                            {exercice.equipments && exercice.equipments.length > 0 &&
                                exercice.equipments.map((equipment: string, index: number) => (
                                    <span
                                        key={`eq-${index}`}
                                        className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium"
                                    >
                                        🏋️ {equipment}
                                    </span>
                                ))
                            }
                        </div>

                        {/* Description - visible si étendu avec animation smooth */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ 
                                        opacity: 1, 
                                        height: "auto",
                                        marginTop: 16
                                    }}
                                    exit={{ 
                                        opacity: 0, 
                                        height: 0,
                                        marginTop: 0
                                    }}
                                    transition={{ 
                                        duration: 0.3,
                                        ease: [0.4, 0, 0.2, 1]
                                    }}
                                    className="overflow-hidden space-y-3"
                                >
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ 
                                            duration: 0.3,
                                            delay: 0.1,
                                            ease: [0.4, 0, 0.2, 1]
                                        }}
                                        className="text-gray-600 leading-relaxed text-sm"
                                    >
                                        {exercice.description.text}
                                    </motion.p>
                                    {exercice.description.comment && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ 
                                                duration: 0.3,
                                                delay: 0.15,
                                                ease: [0.4, 0, 0.2, 1]
                                            }}
                                            className="p-3 bg-slate-50 border-l-2 border-slate-300 text-slate-700 text-sm rounded-r"
                                        >
                                            <span className="font-semibold">Conseil : </span>
                                            {exercice.description.comment}
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Indicateur d'expansion */}
                        <div className="flex justify-center mt-2">
                            <svg 
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Footer avec boutons d'action */}
                    <div 
                        className="border-t border-gray-100 bg-gray-50/70 px-4 py-3 flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Bouton Épingler */}
                        <button
                            onClick={handlePin}
                            disabled={isPinning}
                            className={`
                                flex items-center justify-center p-2.5 rounded-lg
                                transition-all duration-200
                                ${exercice.pinned 
                                    ? 'bg-red-50 text-red-600 border border-red-200' 
                                    : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'
                                }
                            `}
                            title={exercice.pinned ? 'Désépingler' : 'Épingler'}
                            aria-label={exercice.pinned ? 'Désépingler' : 'Épingler'}
                        >
                            <svg className="w-4 h-4" fill={exercice.pinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </button>

                        {/* Bouton Modifier */}
                        <button
                            onClick={handleEdit}
                            className="flex items-center justify-center p-2.5 rounded-lg bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700 transition-all duration-200"
                            title="Modifier"
                            aria-label="Modifier l'exercice"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>

                        {/* Bouton Fait - principal */}
                        <button
                            onClick={handleComplete}
                            disabled={isCompleting}
                            className={`
                                flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                                font-semibold text-sm transition-all duration-200 shadow-sm
                                ${exercice.completed
                                    ? exercice.completedToday
                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                        : 'bg-emerald-400 text-white hover:bg-emerald-500'
                                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 hover:border-gray-400'
                                }
                            `}
                            title={exercice.completed ? (exercice.completedToday ? 'Démarquer' : 'Fait cette semaine - Démarquer') : 'Marquer comme fait'}
                            aria-label={exercice.completed ? 'Démarquer' : 'Marquer comme fait'}
                        >
                            {isCompleting ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>{exercice.completed ? (exercice.completedToday ? 'Fait' : 'Fait cette semaine') : 'Marquer fait'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
