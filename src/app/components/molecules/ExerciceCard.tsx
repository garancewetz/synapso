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
        <div className="border border-gray-200 rounded-lg transition-all text-gray-900">
            <div className="p-2.5 sm:p-4 flex flex-col gap-1.5 sm:gap-2 sm:gap-3">
                {/* Titre */}
                <div className="flex items-center gap-1 sm:gap-1.5 sm:gap-2">
                    <h2 className="text-lg sm:text-xl sm:text-2xl font-mono text-gray-800">{exercice.name}</h2>
                    {exercice.completed && <span className="text-emerald-600 text-sm sm:text-base">✓</span>}
                </div>

                {/* Tags en flex */}
                <div className="flex flex-wrap gap-1">
                    {exercice.bodyparts && exercice.bodyparts.length > 0 && exercice.bodyparts.map((bodypart, index: number) => (
                        <Tag key={index} color={bodypart.color} className="text-xs">
                            {bodypart.name}
                        </Tag>
                    ))}
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
                {/* Description expandable */}
                <div>
                    {isDescriptionExpanded ? (
                        <div>
                            <p className="text-gray-600 mb-2 leading-relaxed text-sm">{exercice.description.text}</p>
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
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            <div className="flex-1 border-t border-gray-300"></div>
                        </div>
                    )}
                </div>


                {/* Boutons : pin, éditer, valider */}
                <div className="flex items-center gap-1 mt-2">
                    <button
                        onClick={handleEdit}
                        className="flex-1 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded  transition-colors cursor-pointer touch-manipulation"
                        title="Modifier"
                        aria-label="Modifier"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={handlePin}
                        disabled={isPinning}
                        className={`flex-1 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded  transition-colors cursor-pointer touch-manipulation ${exercice.pinned
                            ? 'text-amber-500 hover:text-amber-600'
                            : ''
                            }`}
                        title={exercice.pinned ? 'Désépingler' : 'Épingler'}
                        aria-label={exercice.pinned ? 'Désépingler' : 'Épingler'}
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" fill={exercice.pinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </button>

                    <button
                        onClick={handleComplete}
                        disabled={isCompleting}
                        className={`flex-1 p-2 flex justify-center items-center rounded border transition-all cursor-pointer touch-manipulation ${exercice.completed
                            ? 'text-white bg-emerald-500 border-emerald-500'
                            : 'text-gray-600 border-gray-300 hover:text-white hover:bg-emerald-500 hover:border-emerald-500'
                            }`}
                        title={exercice.completed ? 'Complété' : 'Marquer comme complété'}
                        aria-label={exercice.completed ? 'Complété' : 'Marquer comme complété'}
                    >
                        <span className="text-xs font-bold">{isCompleting ? '...' : '✓'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
