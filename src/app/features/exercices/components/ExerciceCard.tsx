'use client';

import { useState, useCallback, useMemo, memo, useRef, useLayoutEffect } from "react";
import type { Exercice } from '@/app/types';
import { CATEGORY_COLORS } from '@/app/constants/exercice.constants';
import { useUser } from '@/app/contexts/UserContext';
import { useCompleteExercice } from '../hooks/useCompleteExercice';
import { useArchiveExercice } from '../hooks/useArchiveExercice';
import { useShareExercice, ConfettiValidate } from '@/app/features/exercices';
import { CompleteButton, BaseCard, DotMenu } from '@/app/components/ui';
import { ExerciceCardHeader } from './ExerciceCardHeader';
import { ExerciceCardTags } from './ExerciceCardTags';
import { ExerciceCardExpandable } from './ExerciceCardExpandable';
import { ExerciceMedia } from './ExerciceMedia';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { isToday } from 'date-fns';

type Props = {
    exercice: Exercice;
    onEdit?: (id: number) => void;
    onCompleted?: (updatedExercice: Exercice) => void;
    onArchive?: (updatedExercice: Exercice) => void;
};

/**
 * Carte d'exercice avec état de complétion
 * ⚡ PERFORMANCE: Mémorisé avec React.memo pour éviter les re-renders inutiles
 * quand la liste d'exercices change mais pas cet exercice spécifique
 */
const ExerciceCard = memo(function ExerciceCard({ exercice, onEdit, onCompleted, onArchive }: Props) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [confettiCenter, setConfettiCenter] = useState({ x: 50, y: 50 });
    const cardRef = useRef<HTMLDivElement>(null);
    const completeButtonRef = useRef<HTMLDivElement>(null);
    const { effectiveUser } = useUser();
    const { archiveExercice } = useArchiveExercice();
    const { handleShare } = useShareExercice(exercice, cardRef);
    const { selectedDate, isDateSelected } = useSelectedDate();
    const isTimeMachineMode = isDateSelected && selectedDate && !isToday(selectedDate);

    const categoryStyle = useMemo(
        () => CATEGORY_COLORS[exercice.category],
        [exercice.category]
    );

    const { handleComplete, isCompleting, showSuccess } = useCompleteExercice({
        exercice,
        userId: effectiveUser?.id ?? 0,
        onCompleted: effectiveUser ? onCompleted : undefined,
    });

    const handleEdit = useCallback(() => {
        if (onEdit) {
            onEdit(exercice.id);
        }
    }, [onEdit, exercice.id]);

    const handleArchive = useCallback(async () => {
        const updated = await archiveExercice(exercice.id, !exercice.archived);
        if (updated && onArchive) {
            onArchive(updated);
        }
    }, [archiveExercice, exercice.id, exercice.archived, onArchive]);

    const handleShareClick = useCallback(() => {
        handleShare();
    }, [handleShare]);

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

    useLayoutEffect(() => {
        if (showSuccess && completeButtonRef.current) {
            const rect = completeButtonRef.current.getBoundingClientRect();
            setConfettiCenter({
                x: ((rect.left + rect.width / 2) / window.innerWidth) * 100,
                y: ((rect.top + rect.height / 2) / window.innerHeight) * 100,
            });
        }
    }, [showSuccess]);

    return (
        <div ref={cardRef} className="relative h-full">
            <BaseCard
            className="exercise-card h-full"
            fullHeight
            onClick={toggleExpand}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            ariaExpanded={isExpanded}
            aria-label={`${exercice.name} - ${exercice.completedToday ? 'Fait aujourd\'hui' : 'À faire'}`}
        >
            {/* Double accent : couleur catégorie + indigo en mode sablier */}
            <div className="flex shrink-0">
                <BaseCard.Accent color={categoryStyle.accent} />
             
            </div>
            <BaseCard.Content className="flex flex-col relative">
                {/* Indicateur mode sablier - emoji sablier visible pour accessibilité cognitive */}
                {isTimeMachineMode && (
                    <div 
                        className="absolute top-3 right-3 z-50 flex items-center justify-center size-7 bg-indigo-600/95 backdrop-blur-sm rounded-full shadow-lg border-2 border-amber-400/50"
                        title="Mode sablier actif - Tu es sur une date passée"
                        aria-label="Mode sablier actif"
                        style={{ pointerEvents: 'none' }}
                    >
                        <span className="text-base text-amber-300 drop-shadow-lg leading-none">
                            {NAVIGATION_EMOJIS.HOURGLASS}
                        </span>
                    </div>
                )}
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
                    <DotMenu
                        containerRef={cardRef}
                        onArchive={handleArchive}
                        onEdit={handleEdit}
                        onShare={handleShareClick}
                        isArchived={exercice.archived ?? false}
                    />

                    <div ref={completeButtonRef} className="flex-1 flex min-w-0">
                        <CompleteButton
                            onClick={handleComplete}
                            isCompleted={exercice.completed}
                            isCompletedToday={exercice.completedToday}
                            isLoading={isCompleting}
                            weeklyCount={exercice.weeklyCompletions?.length || 0}
                        />
                    </div>
                </BaseCard.Footer>
            </BaseCard.Content>
            </BaseCard>
            
            {showSuccess && (
                <ConfettiValidate
                    show
                    centerX={confettiCenter.x}
                    centerY={confettiCenter.y}
                />
            )}

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
