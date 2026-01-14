'use client';

import { useState, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from 'clsx';
import type { Exercice } from '@/app/types';
import { CATEGORY_COLORS } from '@/app/constants/exercice.constants';
import { useUser } from '@/app/contexts/UserContext';
import { triggerCompletedCountRefresh } from '@/app/hooks/useTodayCompletedCount';
import { ChevronIcon, EditIcon, HeartIcon } from '@/app/components/ui/icons';
import { Badge, Button, CompleteButton, BaseCard, WeeklyCompletionIndicator } from '@/app/components/ui';
import { CheckIcon } from '@/app/components/ui/icons';
import { getDayName } from '@/app/utils/date.utils';

type Props = {
    exercice: Exercice;
    onEdit?: (id: number) => void;
    onCompleted?: (updatedExercice: Exercice) => void;
};

/**
 * Carte d'exercice avec état de complétion
 * ⚡ PERFORMANCE: Mémorisé avec React.memo pour éviter les re-renders inutiles
 * quand la liste d'exercices change mais pas cet exercice spécifique
 */
const ExerciceCard = memo(function ExerciceCard({ exercice, onEdit, onCompleted }: Props) {
    const [isCompleting, setIsCompleting] = useState(false);
    const [isPinning, setIsPinning] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { effectiveUser } = useUser();

    // Mémoriser le style de catégorie
    const categoryStyle = useMemo(
        () => CATEGORY_COLORS[exercice.category],
        [exercice.category]
    );

    const handleEdit = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (onEdit) {
            onEdit(exercice.id);
        }
    }, [onEdit, exercice.id]);

    const handleComplete = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!effectiveUser) return;

        setIsCompleting(true);
        try {
            const response = await fetch(`/api/exercices/${exercice.id}/complete?userId=${effectiveUser.id}`, {
                method: 'PATCH',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                const wasCompletedToday = exercice.completedToday;
                // Créer l'exercice mis à jour localement avec les nouvelles valeurs
                const updatedExercice: Exercice = {
                    ...exercice,
                    completed: data.completed,
                    completedToday: data.completedToday ?? false,
                    completedAt: data.completedAt ? new Date(data.completedAt) : null,
                    weeklyCompletions: data.weeklyCompletions || exercice.weeklyCompletions,
                };
                if (!wasCompletedToday && updatedExercice.completedToday) {
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
    }, [effectiveUser, exercice, onCompleted]);

    const handlePin = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!effectiveUser) return;

        setIsPinning(true);
        try {
            const response = await fetch(`/api/exercices/${exercice.id}/pin?userId=${effectiveUser.id}`, {
                method: 'PATCH',
                credentials: 'include',
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
    }, [effectiveUser, exercice, onCompleted]);

    const toggleExpand = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpand();
        }
    }, [toggleExpand]);

    return (
        <BaseCard
            className={clsx(
                'exercise-card h-full',
                showSuccess && 'success-animation'
            )}
            fullHeight
            onClick={toggleExpand}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            ariaExpanded={isExpanded}
            ariaLabel={`${exercice.name} - ${exercice.completedToday ? 'Fait aujourd\'hui' : 'À faire'}`}
        >
            <BaseCard.Accent color={categoryStyle.accent} />
            <BaseCard.Content className="flex flex-col">
                {/* Header avec titre */}
                <div className="flex-1 p-4 md:p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base md:text-lg font-semibold text-gray-800 leading-tight">
                                    {exercice.name}
                                </h3>
                            </div>

                            {/* Badge complété OU indicateur hebdomadaire */}
                            <div className="flex items-center gap-2">
                                {/* Si mode WEEKLY : afficher l'indicateur de jours */}
                                {effectiveUser?.resetFrequency === 'WEEKLY' && exercice.weeklyCompletions && exercice.weeklyCompletions.length > 0 ? (
                                    <WeeklyCompletionIndicator 
                                        completions={exercice.weeklyCompletions}
                                    />
                                ) : (
                                    /* Si mode DAILY : badge classique */
                                    exercice.completedToday && (
                                        <Badge 
                                            variant="completed"
                                            icon={<CheckIcon className="w-3.5 h-3.5" />}
                                        >
                                            {exercice.completedToday ? 'Fait' : getDayName(exercice.completedAt)}
                                        </Badge>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Tags : bodyparts, workout, équipements */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {/* Bodyparts - couleur pâle de la catégorie */}
                            {exercice.bodyparts && exercice.bodyparts.length > 0 &&
                                exercice.bodyparts.map((bodypart) => (
                                    <Badge key={bodypart} className={categoryStyle.tag}>
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
                                exercice.equipments.map((equipment: string) => (
                                    <Badge key={equipment} variant="equipment" icon="🏋️">
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
                <BaseCard.Footer onClick={(e) => e.stopPropagation()}>
                    {/* Bouton Favori */}
                    <Button
                        iconOnly
                        onClick={handlePin}
                        disabled={isPinning}
                        isActive={exercice.pinned}
                        title={exercice.pinned ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        aria-label={exercice.pinned ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                        <HeartIcon className="w-4 h-4" filled={exercice.pinned} />
                    </Button>

                    {/* Bouton Modifier */}
                    <Button
                        iconOnly
                        onClick={handleEdit}
                        title="Modifier"
                        aria-label="Modifier l'exercice"
                    >
                        <EditIcon className="w-4 h-4" />
                    </Button>

                    {/* Bouton Fait - principal */}
                    <CompleteButton
                        onClick={handleComplete}
                        isCompleted={exercice.completed}
                        isCompletedToday={exercice.completedToday}
                        isLoading={isCompleting}
                        weeklyCount={exercice.weeklyCompletions?.length || 0}
                        resetFrequency={effectiveUser?.resetFrequency}
                    />
                </BaseCard.Footer>
            </BaseCard.Content>
        </BaseCard>
    );
});

export { ExerciceCard };
