'use client';

import { useState } from "react";
import type { Exercice } from '@/types';
import { ExerciceCategory, CATEGORY_LABELS, CATEGORY_COLORS, BODYPART_COLORS } from '@/types/exercice';
import { useUser } from '@/contexts/UserContext';

// Emojis pour chaque catégorie (accessibilité : couleur + icône)
const CATEGORY_ICONS: Record<ExerciceCategory, string> = {
    LOWER_BODY: '🦵',   // Jambe = Bas du corps
    UPPER_BODY: '💪',   // Bras = Haut du corps
    STRETCHING: '🧘',   // Yoga = Étirements
};

interface ExerciceCardProps {
    exercice: Exercice;
    onEdit?: (id: number) => void;
    onCompleted?: () => void;
}

export default function ExerciceCard({ exercice, onEdit, onCompleted }: ExerciceCardProps) {
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
                if (!exercice.completed) {
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 1500);
                }
                if (onCompleted) {
                    onCompleted();
                }
            } else {
                console.error('Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur:', error);
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
                if (onCompleted) {
                    onCompleted();
                }
            } else {
                console.error('Erreur lors de la mise à jour du pin');
            }
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setIsPinning(false);
        }
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
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
            role="article"
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
                                {/* Emoji de catégorie aligné avec label + titre */}
                                <span className="flex-shrink-0 text-2xl" role="img" aria-label={CATEGORY_LABELS[exercice.category]}>
                                    {CATEGORY_ICONS[exercice.category]}
                                </span>
                                <div className="flex-1 min-w-0">
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
                                    <h3 className="text-base md:text-lg font-semibold text-gray-900 leading-tight">
                                        {exercice.name}
                                    </h3>
                                </div>
                            </div>

                            {/* Badge complété */}
                            {exercice.completed && (
                                <span className="flex-shrink-0 bg-emerald-500 text-white text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Fait
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
                            {exercice.workout.series && exercice.workout.series > 1 && (
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

                        {/* Description - visible si étendu */}
                        {isExpanded && (
                            <div className="mt-4 space-y-3 animate-in slide-in-from-top duration-200">
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {exercice.description.text}
                                </p>
                                {exercice.description.comment && (
                                    <div className="p-3 bg-slate-50 border-l-2 border-slate-300 text-slate-700 text-sm rounded-r">
                                        <span className="font-semibold">Conseil : </span>
                                        {exercice.description.comment}
                                    </div>
                                )}
                            </div>
                        )}

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
                                font-medium text-sm transition-all duration-200
                                ${exercice.completed
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                }
                            `}
                            title={exercice.completed ? 'Démarquer' : 'Marquer comme fait'}
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
                                    <span>{exercice.completed ? 'Fait' : 'Marquer fait'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
