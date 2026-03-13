'use client';

import { useState, useCallback, useMemo, memo, useRef } from "react";
import dynamic from 'next/dynamic';
import clsx from 'clsx';
import type { Exercice } from '@/app/types';
import { CATEGORY_COLORS } from '@/app/constants/exercice.constants';
import { useUser } from '@/app/contexts/UserContext';
import { useCompleteExercice } from '../hooks/useCompleteExercice';
import { useExerciceCardActions } from '../hooks/useExerciceCardActions';
import { useExerciceCardMedia } from '../hooks/useExerciceCardMedia';
import { ShareToUserModal } from '@/app/features/sharing';
import { CompleteButton, BaseCard, Button, CardActionButton, CardActionsPanel, InlineSpinner } from '@/app/components/ui';
import { DotsIcon, EditIcon, ShareIcon, BookmarkIcon } from '@/app/components/ui/icons';
import { ExerciceCardHeader } from './ExerciceCardHeader';
import { ExerciceCardTags } from './ExerciceCardTags';
import { ExerciceCardExpandable } from './ExerciceCardExpandable';
import { ExerciceMedia } from './ExerciceMedia';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { isToday } from 'date-fns';

const LazyConfettiValidate = dynamic(
    () => import('./ConfettiValidate').then(mod => ({ default: mod.ConfettiValidate })),
    { ssr: false }
);

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
    const cardRef = useRef<HTMLDivElement>(null);
    const completeButtonRef = useRef<HTMLDivElement>(null);
    const { effectiveUser } = useUser();
    const { selectedDate, isDateSelected } = useTimeContext();
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

    const {
        isActionsOpen,
        isShareModalOpen,
        setIsShareModalOpen,
        isArchiving,
        isPinning,
        handleEdit,
        handleArchive,
        handlePinClick,
        handleShareClick,
        toggleActions,
    } = useExerciceCardActions({
        exercice,
        userId: effectiveUser?.id ?? 0,
        onEdit,
        onCompleted,
        onArchive,
        cardRef,
    });

    const {
        lightboxIndex,
        handleOpenMedia,
        handleLightboxOpen,
        handleLightboxClose,
        hasPhotos,
    } = useExerciceCardMedia(exercice.media);

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
                        onLightboxOpen={handleLightboxOpen}
                    />
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                    {/* Footer : bouton dots + CompleteButton — toujours stable */}
                    <BaseCard.Footer>
                        <Button
                            iconOnly
                            onClick={toggleActions}
                            aria-label={isActionsOpen ? 'Fermer les actions' : 'Ouvrir les actions'}
                            aria-expanded={isActionsOpen}
                        >
                            <DotsIcon className={clsx('w-5 h-5 transition-transform duration-200', isActionsOpen && 'rotate-90')} />
                        </Button>

                        <div ref={completeButtonRef} className="relative flex-1 flex min-w-0">
                            <CompleteButton
                                onClick={handleComplete}
                                isCompleted={exercice.completed}
                                isCompletedToday={exercice.completedToday}
                                isLoading={isCompleting}
                                weeklyCount={exercice.weeklyCompletions?.length || 0}
                            />
                            {showSuccess && (
                                <LazyConfettiValidate
                                    show
                                    centerX={50}
                                    centerY={50}
                                />
                            )}
                        </div>
                    </BaseCard.Footer>

                    {/* Actions inline — s'ouvre en dessous du footer */}
                    <CardActionsPanel isOpen={isActionsOpen}>
                                <CardActionButton
                                    icon={<EditIcon className="w-5 h-5" />}
                                    label="Modifier"
                                    onClick={handleEdit}
                                    className="border-r border-b border-gray-200"
                                />
                                <CardActionButton
                                    icon={isPinning
                                        ? <InlineSpinner />
                                        : <BookmarkIcon className="w-5 h-5" filled={exercice.pinned} />
                                    }
                                    label={exercice.pinned ? 'Désépingler' : 'Épingler'}
                                    onClick={handlePinClick}
                                    disabled={isPinning}
                                    className="border-b border-gray-200"
                                />
                                <CardActionButton
                                    icon={<ShareIcon className="w-5 h-5" />}
                                    label="Partager"
                                    onClick={handleShareClick}
                                    className="border-r border-gray-200"
                                />
                                <CardActionButton
                                    icon={isArchiving
                                        ? <InlineSpinner />
                                        : <span className="text-xl">{exercice.archived ? '📤' : '📦'}</span>
                                    }
                                    label={exercice.archived ? 'Désarchiver' : 'Archiver'}
                                    onClick={handleArchive}
                                    disabled={isArchiving}
                                />
                    </CardActionsPanel>
                </div>
            </BaseCard.Content>
            </BaseCard>

            {/* Lightbox - rendu en dehors de la carte pour être plein écran */}
            {hasPhotos && lightboxIndex !== null && (
                <ExerciceMedia
                    media={exercice.media}
                    maxPhotos={3}
                    initialLightboxIndex={lightboxIndex}
                    onLightboxClose={handleLightboxClose}
                    onLightboxOpen={handleLightboxOpen}
                    showThumbnails={false}
                    title={exercice.name}
                />
            )}

            {/* Modale de partage à un utilisateur */}
            <ShareToUserModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                exerciceId={exercice.id}
            />
        </div>
    );
});

export { ExerciceCard };
