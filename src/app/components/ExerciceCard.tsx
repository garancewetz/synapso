'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Exercice } from '@/app/types';
import { CATEGORY_COLORS } from '@/app/constants/exercice.constants';
import { useUser } from '@/app/contexts/UserContext';
import { triggerCompletedCountRefresh } from '@/app/hooks/useTodayCompletedCount';
import { ChevronIcon, EditIcon, PinIcon } from '@/app/components/ui/icons';
import { Badge, IconButton, CompleteButton, CompletedBadge } from '@/app/components/ui';
interface ExerciceCardProps {
    exercice: Exercice;
    onEdit?: (id: number) => void;
    onCompleted?: (updatedExercice: Exercice) => void;
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
                            <div className="flex-1 min-w-0">
                                {/* Icône épinglé */}
                                {exercice.pinned && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <PinIcon className="w-3.5 h-3.5 text-red-500" fill="currentColor" />
                                    </div>
                                )}
                                <h3 className="text-base md:text-lg font-semibold text-gray-900 leading-tight">
                                    {exercice.name}
                                </h3>
                            </div>

                            {/* Badge complété */}
                            {exercice.completed && (
                                <CompletedBadge 
                                    isCompletedToday={exercice.completedToday}
                                    completedAt={exercice.completedAt}
                                />
                            )}
                        </div>

                        {/* Tags : bodyparts, workout, équipements */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {/* Bodyparts - couleur pâle de la catégorie */}
                            {exercice.bodyparts && exercice.bodyparts.length > 0 &&
                                exercice.bodyparts.map((bodypart, index) => (
                                    <Badge key={`bp-${index}`} className={categoryStyle.tag}>
                                        {bodypart}
                                    </Badge>
                                ))
                            }
                            {/* Séries */}
                            {exercice.workout.series && exercice.workout.series !== '1' && (
                                <Badge variant="workout">
                                    {exercice.workout.series} séries
                                </Badge>
                            )}
                            {/* Répétitions */}
                            {exercice.workout.repeat && (
                                <Badge variant="workout">
                                    {exercice.workout.repeat}x
                                </Badge>
                            )}
                            {/* Durée */}
                            {exercice.workout.duration && (
                                <Badge variant="workout">
                                    {exercice.workout.duration}
                                </Badge>
                            )}
                            {/* Équipements */}
                            {exercice.equipments && exercice.equipments.length > 0 &&
                                exercice.equipments.map((equipment: string, index: number) => (
                                    <Badge key={`eq-${index}`} variant="equipment" icon="🏋️">
                                        {equipment}
                                    </Badge>
                                ))
                            }
                        </div>

                        {/* Description - visible si étendu avec animation smooth */}
                        {exercice.description.text && (
                            <>
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
                                                duration: 0.15,
                                                ease: "easeOut"
                                            }}
                                            className="overflow-hidden space-y-3"
                                        >
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ 
                                                    duration: 0.1
                                                }}
                                                className="text-gray-600 leading-relaxed text-sm"
                                            >
                                                {exercice.description.text}
                                            </motion.p>
                                            {exercice.description.comment && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ 
                                                        duration: 0.1
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
                                    <ChevronIcon 
                                        className={`w-4 h-4 text-gray-400 transition-transform duration-200`}
                                        direction={isExpanded ? 'up' : 'down'}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer avec boutons d'action */}
                    <div 
                        className="border-t border-gray-100 bg-gray-50/70 px-4 py-3 flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Bouton Épingler */}
                        <IconButton
                            onClick={handlePin}
                            disabled={isPinning}
                            isActive={exercice.pinned}
                            title={exercice.pinned ? 'Désépingler' : 'Épingler'}
                            aria-label={exercice.pinned ? 'Désépingler' : 'Épingler'}
                        >
                            <PinIcon className="w-4 h-4" fill={exercice.pinned ? "currentColor" : "none"} />
                        </IconButton>

                        {/* Bouton Modifier */}
                        <IconButton
                            onClick={handleEdit}
                            title="Modifier"
                            aria-label="Modifier l'exercice"
                        >
                            <EditIcon className="w-4 h-4" />
                        </IconButton>

                        {/* Bouton Fait - principal */}
                        <CompleteButton
                            onClick={handleComplete}
                            isCompleted={exercice.completed}
                            isCompletedToday={exercice.completedToday}
                            isLoading={isCompleting}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
