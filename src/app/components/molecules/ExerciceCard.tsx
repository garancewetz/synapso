'use client';

import { useState } from "react";
import Tag from "../atoms/Tag";
import type { Exercice, BodypartSection } from '@/types';
import { useUser } from '@/contexts/UserContext';

interface ExerciceCardProps {
    id: number;
    exercice: Exercice;
    onEdit?: (id: number) => void;
    onCompleted?: () => void;
    bodypartSection: BodypartSection;
}

export default function ExerciceCard({ id, exercice, onEdit, onCompleted }: ExerciceCardProps) {
    const [isCompleting, setIsCompleting] = useState(false);
    const [isPinning, setIsPinning] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const { currentUser } = useUser();

    const handleEdit = () => {
        if (onEdit) {
            onEdit(id);
        }
    };

    const handleComplete = async () => {
        if (!currentUser) return;
        
        setIsCompleting(true);
        try {
            const response = await fetch(`/api/exercices/${id}/complete?userId=${currentUser.id}`, {
                method: 'PATCH',
            });

            if (response.ok) {
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

    const handlePin = async () => {
        if (!currentUser) return;
        
        setIsPinning(true);
        try {
            const response = await fetch(`/api/exercices/${id}/pin?userId=${currentUser.id}`, {
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

    return (
        <div className="relative p-2.5 sm:p-4 border border-gray-200 rounded-lg transition-all text-gray-900">
            {/* Boutons en haut à droite : Édition (gauche) et Pin (droite, plus grand) */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1.5 sm:gap-2 z-10">
                <button
                    onClick={handleEdit}
                    className="p-2 sm:p-2.5 sm:p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer touch-manipulation"
                    title="Modifier"
                    aria-label="Modifier"
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button
                    onClick={handlePin}
                    disabled={isPinning}
                    className={`p-2 sm:p-2.5 sm:p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer touch-manipulation ${
                        exercice.pinned 
                            ? 'text-amber-500 hover:text-amber-600' 
                            : ''
                    }`}
                    title={exercice.pinned ? 'Désépingler' : 'Épingler'}
                    aria-label={exercice.pinned ? 'Désépingler' : 'Épingler'}
                >
                    <svg className="w-4 h-4 sm:w-5 sm:w-6 sm:h-6" fill={exercice.pinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </button>
            </div>

            <div className="flex flex-col gap-1.5 sm:gap-2 sm:gap-3 h-full pr-14 sm:pr-16 sm:pr-20">
                {/* Partie gauche : Titre et informations principales */}
                <div className="">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                        <h2 className="text-sm sm:text-base sm:text-lg text-gray-800 pr-12 sm:pr-0">{exercice.name}</h2>
                        <div className="flex flex-wrap gap-1 sm:gap-1.5">
                            {exercice.bodyparts && exercice.bodyparts.length > 0 && exercice.bodyparts.map((bodypart, index: number) => (
                                <Tag key={index} color={bodypart.color} className="text-xs">
                                    {bodypart.name}
                                </Tag>
                            ))}
                            {exercice.completed && <span className="text-emerald-600 text-sm sm:text-base">✓</span>}
                        </div>
                    </div>
                    
                    {/* Description expandable */}
                    <div className="mb-1.5 sm:mb-2">
                        {isDescriptionExpanded ? (
                            <div>
                                <p className="text-gray-600 mb-2 leading-relaxed text-xs sm:text-sm">{exercice.description.text}</p>
                                {exercice.description.comment && (
                                    <div className="mb-2 p-2 sm:p-2.5 bg-amber-50 border-l-2 border-amber-400 text-amber-900 text-xs sm:text-sm leading-relaxed rounded-r">
                                        <span className="font-medium">💡 Note :</span> {exercice.description.comment}
                                    </div>
                                )}
                                <div 
                                    onClick={() => setIsDescriptionExpanded(false)}
                                    className="flex items-center gap-2 my-2 cursor-pointer touch-manipulation"
                                >
                                    <div className="flex-1 border-t border-gray-300"></div>
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 border-t border-gray-300"></div>
                                </div>
                            </div>
                        ) : (
                            <div 
                                onClick={() => setIsDescriptionExpanded(true)}
                                className="flex items-center gap-2 my-2 cursor-pointer touch-manipulation"
                            >
                                <div className="flex-1 border-t border-gray-300"></div>
                                <div className="flex items-center gap-1 text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                <div className="flex-1 border-t border-gray-300"></div>
                            </div>
                        )}
                    </div>
                    
                    {/* Tags compacts en ligne */}
                    <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                        {exercice.equipments && exercice.equipments.length > 0 &&
                            exercice.equipments.map((equipment: string, index: number) => (
                                <Tag key={index} className="text-xs bg-gray-50 border-gray-100">
                                    {equipment}
                                </Tag>
                            ))
                        }
                        
                        {exercice.workout.series && exercice.workout.series > 1 && (
                            <Tag className="text-xs bg-gray-50 border-gray-100">Séries: {exercice.workout.series}</Tag>
                        )}
                        {exercice.workout.repeat && (
                            <Tag className="text-xs bg-gray-50 border-gray-100">Répétitions: {exercice.workout.repeat}x</Tag>
                        )}
                        {exercice.workout.duration && (
                            <Tag className="text-xs bg-gray-50 border-gray-100">{exercice.workout.duration}</Tag>
                        )}
                    </div>
                </div>
            </div>

            {/* Bouton compléter en bas à droite (absolute) */}
            <button
                onClick={handleComplete}
                disabled={isCompleting}
                className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 sm:w-10 sm:h-10 flex justify-center items-center rounded-lg border transition-all cursor-pointer touch-manipulation z-10 ${
                    exercice.completed 
                        ? 'text-white bg-emerald-500 border-emerald-500 scale-105' 
                        : 'text-gray-600 border-gray-300 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 hover:scale-110'
                }`}
                title={exercice.completed ? 'Complété' : 'Marquer comme complété'}
                aria-label={exercice.completed ? 'Complété' : 'Marquer comme complété'}
            >
                <span className="text-xs sm:text-sm font-bold">{isCompleting ? '...' : '✓'}</span>
            </button>
        </div>
    );
}
