'use client';

import { useState, useCallback, useMemo, memo } from "react";
import clsx from 'clsx';
import type { Exercice } from '@/app/types';
import { CATEGORY_COLORS } from '@/app/constants/exercice.constants';
import { useUser } from '@/app/contexts/UserContext';
import { useHistoryContext } from '@/app/contexts/HistoryContext';
import { useCompleteExercice } from '@/app/hooks/useCompleteExercice';
import { EditIcon } from '@/app/components/ui/icons';
import { Button, CompleteButton, BaseCard } from '@/app/components/ui';
import { ExerciceCardHeader } from '@/app/components/ExerciceCardHeader';
import { ExerciceCardTags } from '@/app/components/ExerciceCardTags';
import { ExerciceCardExpandable } from '@/app/components/ExerciceCardExpandable';
import { ExerciceMedia } from '@/app/components/ExerciceMedia';

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
    const [isExpanded, setIsExpanded] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const { effectiveUser } = useUser();
    const { refreshHistory } = useHistoryContext();

    const categoryStyle = useMemo(
        () => CATEGORY_COLORS[exercice.category],
        [exercice.category]
    );

    const { handleComplete, isCompleting, showSuccess } = useCompleteExercice({
        exercice,
        userId: effectiveUser?.id ?? 0,
        onCompleted: effectiveUser ? onCompleted : undefined,
        refreshHistory: effectiveUser ? refreshHistory : undefined,
    });

    const handleEdit = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (onEdit) {
            onEdit(exercice.id);
        }
    }, [onEdit, exercice.id]);

    const toggleExpand = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpand();
        }
    }, [toggleExpand]);

    const handleOpenMedia = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (exercice.media?.photos && exercice.media.photos.length > 0) {
            setLightboxIndex(0);
        }
    }, [exercice.media]);

    return (
        <div className="relative h-full">
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
            aria-label={`${exercice.name} - ${exercice.completedToday ? 'Fait aujourd\'hui' : 'À faire'}`}
        >
            <BaseCard.Accent color={categoryStyle.accent} />
            <BaseCard.Content className="flex flex-col relative">
                <div className="flex-1 p-4 md:p-5">
                    <ExerciceCardHeader
                        exercice={exercice}
                        effectiveUserResetFrequency={effectiveUser?.resetFrequency}
                        onOpenMedia={handleOpenMedia}
                    />
                    <ExerciceCardTags exercice={exercice} />
                    <ExerciceCardExpandable
                        exercice={exercice}
                        isExpanded={isExpanded}
                        onLightboxOpen={(index: number) => setLightboxIndex(index)}
                    />
                </div>
                <BaseCard.Footer onClick={(e) => e.stopPropagation()}>
                    <Button
                        iconOnly
                        onClick={handleEdit}
                        title="Modifier"
                        aria-label="Modifier l'exercice"
                    >
                        <EditIcon className="w-4 h-4" />
                    </Button>

                    <CompleteButton
                        onClick={handleComplete}
                        isCompleted={exercice.completed}
                        isCompletedToday={exercice.completedToday}
                        isLoading={isCompleting}
                        weeklyCount={exercice.weeklyCompletions?.length || 0}
                    />
                </BaseCard.Footer>
            </BaseCard.Content>
            </BaseCard>
            
            {/* Lightbox - rendu en dehors de la carte pour être plein écran */}
            {exercice.media && exercice.media.photos && exercice.media.photos.length > 0 && lightboxIndex !== null && (
                <ExerciceMedia
                    media={exercice.media}
                    maxPhotos={3}
                    initialLightboxIndex={lightboxIndex}
                    onLightboxClose={() => setLightboxIndex(null)}
                    onLightboxOpen={(index: number) => setLightboxIndex(index)}
                    showThumbnails={false}
                    title={exercice.name}
                />
            )}
        </div>
    );
});

export { ExerciceCard };
