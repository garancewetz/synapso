'use client';

import { useState } from "react";
import Tag from "../atoms/Tag";
import Alert from "../atoms/Alert";
import { getBgColor, getBgColorLight } from "@/app/utils/colors";

interface ExerciceCardProps {
    id: number;
    exercice: any;
    onEdit?: (id: number) => void;
    onCompleted?: () => void;
    bodypartSection: any;
}

export default function ExerciceCard({ id, exercice, onEdit, onCompleted, bodypartSection }: ExerciceCardProps) {
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
        <div className="overflow-hidden relative p-6 border border-gray-200 rounded-lg transition-all bg-white hover:shadow-lg shadow-sm hover:border-gray-300 text-gray-900 min-h-[100px]">
            <div className="flex items-center justify-between gap-6 h-full">
                {/* Partie gauche : Titre et informations principales */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-xl font-bold">{exercice.name}</h2>
                        {exercice.completed && <span className="text-emerald-600 text-lg">✓</span>}
                    </div>
                    
                    <p className="text-gray-600 mb-3 leading-relaxed">{exercice.description.text}</p>
                    
                    {exercice.description.comment && (
                        <Alert className="mb-3">{exercice.description.comment}</Alert>
                    )}
                    
                    {/* Tags compacts en ligne */}
                    <div className="flex flex-wrap gap-2">
                        {exercice.bodyparts && exercice.bodyparts.length > 0 && exercice.bodyparts.map((bodypart: any, index: number) => (
                            <Tag key={index} color={bodypart.color} className="text-sm">
                                {bodypart.name}
                            </Tag>
                        ))}
                        
                        {exercice.equipments && exercice.equipments.length > 0 &&
                            exercice.equipments.map((equipment: string, index: number) => (
                                <Tag key={index} className="text-sm">
                                    {equipment}
                                </Tag>
                            ))
                        }
                        
                        {exercice.workout.series && exercice.workout.series > 1 && (
                            <Tag className="text-sm">Séries: {exercice.workout.series}</Tag>
                        )}
                        {exercice.workout.repeat && (
                            <Tag className="text-sm">Répétitions: {exercice.workout.repeat}x</Tag>
                        )}
                        {exercice.workout.duration && (
                            <Tag className="text-sm">{exercice.workout.duration}</Tag>
                        )}
                    </div>
                </div>

                {/* Partie droite : Boutons d'action */}
                <div className="flex flex-col gap-3 items-center flex-shrink-0">
                    <button
                        onClick={handleEdit}
                        className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Modifier"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={handleComplete}
                        disabled={isCompleting}
                        className={`w-10 h-10 flex justify-center items-center rounded-lg border transition-all ${
                            exercice.completed 
                                ? 'text-white bg-emerald-500 border-emerald-500 scale-105' 
                                : 'text-gray-600 border-gray-300 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 hover:scale-105'
                        }`}
                        title={exercice.completed ? 'Complété' : 'Marquer comme complété'}
                    >
                        <span className="text-lg font-bold">{isCompleting ? '...' : '✓'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
