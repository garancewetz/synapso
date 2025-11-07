'use client';

import { useState } from "react";
import Tag from "../atoms/Tag";
import type { Exercice, BodypartSection } from '@/types';

interface ExerciceCardProps {
    id: number;
    exercice: Exercice;
    onEdit?: (id: number) => void;
    onCompleted?: () => void;
    bodypartSection: BodypartSection;
}

export default function ExerciceCard({ id, exercice, onEdit, onCompleted }: ExerciceCardProps) {
    const [isCompleting, setIsCompleting] = useState(false);

    const handleEdit = () => {
        if (onEdit) {
            onEdit(id);
        }
    };

    const handleComplete = async () => {
        setIsCompleting(true);
        try {
            const response = await fetch(`/api/exercices/${id}/complete`, {
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

    return (
        <div className="relative p-4 border border-gray-200 rounded-lg transition-all text-gray-900">
            <div className="flex justify-between gap-2 sm:gap-3 h-full">
                {/* Partie gauche : Titre et informations principales */}
                <div className="">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 mb-4">
                        <h2 className="text-base sm:text-lg text-gray-800 ">{exercice.name}</h2>
                        <div className="flex flex-wrap gap-1.5">
                            {exercice.bodyparts && exercice.bodyparts.length > 0 && exercice.bodyparts.map((bodypart, index: number) => (
                                <Tag key={index} color={bodypart.color} className="text-xs">
                                    {bodypart.name}
                                </Tag>
                            ))}
                            {exercice.completed && <span className="text-emerald-600 text-base">✓</span>}
                        </div>
                    </div>
                    
                    <p className="text-gray-600 mb-2 leading-relaxed text-sm">{exercice.description.text}</p>
                    
                    {exercice.description.comment && (
                        <div className="mb-2 p-2.5 bg-amber-50 border-l-2 border-amber-400 text-amber-900 text-sm leading-relaxed rounded-r">
                            <span className="font-medium">💡 Note :</span> {exercice.description.comment}
                        </div>
                    )}
                    
                    {/* Tags compacts en ligne */}
                    <div className="flex flex-wrap gap-1 mt-3">
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

                {/* Partie droite : Boutons d'action */}
                <div className="flex flex-col gap-2  justify-between flex-shrink-0">
                    <button
                        onClick={handleEdit}
                        className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="Modifier"
                    >
                        <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={handleComplete}
                        disabled={isCompleting}
                        className={`w-7 h-7 sm:w-8 sm:h-8 flex justify-center items-center rounded-lg border transition-all cursor-pointer ${
                            exercice.completed 
                                ? 'text-white bg-emerald-500 border-emerald-500 scale-105' 
                                : 'text-gray-600 border-gray-300 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 hover:scale-110'
                        }`}
                        title={exercice.completed ? 'Complété' : 'Marquer comme complété'}
                    >
                        <span className="text-sm font-bold">{isCompleting ? '...' : '✓'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
