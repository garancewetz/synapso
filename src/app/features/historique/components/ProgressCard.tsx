'use client';

import { useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Progress } from '@/app/types';
import { EditIcon, EyeIcon, ChevronIcon, DotsIcon, BookmarkIcon } from '@/app/components/ui/icons';
import { BaseCard, Button } from '@/app/components/ui';
import { ShareIcon } from '@/app/components/ui/icons';
import { useShareProgress, usePinProgress } from '@/app/features/progress';
import { formatVictoryDate } from '@/app/utils/date.utils';
import { getExerciceCategoryFromEmoji, isOrthophonieProgress, ProgressMedia } from '@/app/features/progress';
import { CATEGORY_LABELS_SHORT } from '@/app/constants/exercice.constants';
import { GOLDEN_TEXT_STYLES } from '@/app/constants/card.constants';
import clsx from 'clsx';
import { useUser } from '@/app/contexts/UserContext';

type Props = {
  progress: Progress;
  onEdit?: (progress: Progress) => void;
  onShare?: (progress: Progress) => void;
  onPin?: (updatedProgress: Progress) => void;
  compact?: boolean;
};

/**
 * Carte de progrès individuelle - Version simplifiée
 * Style doré avec étoile, affichage minimaliste pour vue d'ensemble rapide
 * Principe : minimiser la charge cognitive, maximiser l'encouragement
 */
export function ProgressCard({ progress, onEdit, onShare, onPin, compact = false }: Props) {
  const { effectiveUser } = useUser();
  const { handleShare } = useShareProgress(progress);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { handlePin, isPinning } = usePinProgress({
    progress,
    userId: effectiveUser?.id ?? 0,
    onCompleted: onPin,
  });

  const hasMedia = useMemo(
    () => progress.medias && progress.medias.length > 0,
    [progress.medias]
  );

  // Déterminer la catégorie à partir de l'emoji
  const categoryLabel = useMemo(() => {
    if (isOrthophonieProgress(progress.emoji)) {
      return 'Orthophonie';
    }
    const category = getExerciceCategoryFromEmoji(progress.emoji);
    return category ? CATEGORY_LABELS_SHORT[category] : null;
  }, [progress.emoji]);

  // Mémoriser le handler d'édition
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActionsOpen(false);
    if (onEdit) {
      onEdit(progress);
    }
  }, [onEdit, progress]);

  // Handler de partage
  const handleShareClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleShare();
    setIsActionsOpen(false);
    if (onShare) {
      onShare(progress);
    }
  }, [handleShare, onShare, progress]);

  // Handler de pin
  const handlePinClick = useCallback(async () => {
    await handlePin();
    setIsActionsOpen(false);
  }, [handlePin]);

  // Toggle actions menu
  const toggleActions = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActionsOpen(prev => !prev);
  }, []);

  // Toggle expandable
  const toggleExpand = useCallback(() => {
    if (hasMedia) {
      setIsActionsOpen(false);
      setIsExpanded(prev => !prev);
    }
  }, [hasMedia]);

  // Handler pour ouvrir la lightbox depuis le bouton œil
  const handleOpenMedia = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasMedia) {
      setLightboxIndex(0);
    }
  }, [hasMedia]);

  // Handler pour la navigation clavier
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (hasMedia && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      toggleExpand();
    }
  }, [hasMedia, toggleExpand]);

  const hasActions = onEdit || onShare || onPin;
  const actionCount = [onEdit, onPin, onShare].filter(Boolean).length;

  return (
    <div className="relative">
      <BaseCard
      isGolden
      className={clsx(
        'relative',
        '!bg-gradient-to-br !from-amber-50/95 !via-yellow-50/90 !to-amber-100/85',
        '!border !border-amber-200/60',
        'shadow-sm',
        'transition-all duration-300',
        'md:hover:ring-2 md:hover:ring-amber-300/50 md:hover:ring-offset-2',
        'active:scale-[0.98]',
        hasMedia && 'cursor-pointer'
      )}
      onClick={hasMedia ? toggleExpand : undefined}
      onKeyDown={hasMedia ? handleKeyDown : undefined}
      role={hasMedia ? 'button' : undefined}
      tabIndex={hasMedia ? 0 : undefined}
      ariaExpanded={hasMedia ? isExpanded : undefined}
    >
      {/* Accent doré sur le côté */}
      <BaseCard.Accent />


      <BaseCard.Content className="flex flex-col">
        <div className={clsx(
          compact ? 'p-3' : 'p-4 md:p-5'
        )}>
          {/* Header avec titre et bouton œil */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0 flex items-center gap-2">
              {hasMedia && (
                <button
                  type="button"
                  onClick={handleOpenMedia}
                  className={clsx(
                    'flex items-center justify-center',
                    'w-10 h-10 rounded-lg',
                    'bg-amber-100 text-amber-700',
                    'border border-amber-200',
                    'transition-all duration-200',
                    'md:hover:bg-amber-200 md:hover:border-amber-300 md:hover:scale-105',
                    'active:bg-amber-200 active:scale-95',
                    'focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2',
                    'shrink-0',
                    'touch-manipulation'
                  )}
                  aria-label="Voir les photos du progrès"
                  title="Voir les photos"
                >
                  <EyeIcon className="w-5 h-5" strokeWidth={2.5} />
                </button>
              )}
              <h3 className={clsx(
                GOLDEN_TEXT_STYLES.primary,
                compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl',
                'font-bold leading-tight tracking-tight'
              )}>
                {progress.content}
              </h3>
            </div>
            {progress.pinned && (
              <BookmarkIcon className="w-4 h-4 text-amber-500 shrink-0" filled />
            )}
          </div>

          {/* Expandable avec médias */}
          {hasMedia && (
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
                    className="overflow-hidden"
                  >
                    <ProgressMedia
                      medias={progress.medias}
                      maxPhotos={3}
                      onLightboxOpen={(index: number) => setLightboxIndex(index)}
                      showLightbox={false}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chevron pour indiquer l'expandable */}
              <div className="flex justify-center mt-2">
                <ChevronIcon
                  className="w-4 h-4 text-gray-400 transition-transform duration-200"
                  direction={isExpanded ? 'up' : 'down'}
                />
              </div>
            </>
          )}

          {/* Catégorie et Date */}
          <div className="text-left flex items-center gap-2">
            {categoryLabel && (
              <span className="text-xs text-amber-600 font-medium">
                {categoryLabel}
              </span>
            )}
            {categoryLabel && (
              <span className="text-xs text-amber-700/60">•</span>
            )}
            <p className="text-xs text-amber-700/80 font-medium tracking-wide">
              {formatVictoryDate(progress.createdAt)}
            </p>
          </div>
        </div>

        {/* Footer avec dot menu + actions inline */}
        {hasActions && (
          <div onClick={(e) => e.stopPropagation()}>
            <BaseCard.Footer>
              <Button
                iconOnly
                onClick={toggleActions}
                aria-label={isActionsOpen ? 'Fermer les actions' : 'Ouvrir les actions'}
                aria-expanded={isActionsOpen}
              >
                <DotsIcon className={`w-5 h-5 transition-transform duration-200 ${isActionsOpen ? 'rotate-90' : ''}`} />
              </Button>
            </BaseCard.Footer>

            {/* Actions inline — s'ouvre en dessous du footer */}
            <div
              className="grid overflow-hidden transition-all duration-200 ease-out bg-amber-50/70"
              style={{ gridTemplateRows: isActionsOpen ? '1fr' : '0fr' }}
            >
              <div className="min-h-0">
                <div className={clsx('grid border-t border-amber-200', actionCount === 1 && 'grid-cols-1', actionCount === 2 && 'grid-cols-2', actionCount === 3 && 'grid-cols-3')}>
                  {onEdit && (
                    <button type="button" onClick={handleEdit} className="px-2 py-3 flex flex-col items-center justify-center gap-1 text-center text-sm text-amber-800 hover:bg-amber-100 active:bg-amber-200 transition-colors min-h-[44px] not-last:border-r not-last:border-amber-200">
                      <EditIcon className="w-5 h-5" />
                      <span className="font-medium">Modifier</span>
                    </button>
                  )}
                  {onPin && (
                    <button type="button" onClick={handlePinClick} disabled={isPinning} className="px-2 py-3 flex flex-col items-center justify-center gap-1 text-center text-sm text-amber-800 hover:bg-amber-100 active:bg-amber-200 transition-colors min-h-[44px] not-last:border-r not-last:border-amber-200 disabled:opacity-50 disabled:pointer-events-none">
                      {isPinning ? (
                        <span className="w-5 h-5 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
                      ) : (
                        <BookmarkIcon className="w-5 h-5" filled={progress.pinned === true} />
                      )}
                      <span className="font-medium">{progress.pinned ? 'Démarquer' : 'Pour le kiné'}</span>
                    </button>
                  )}
                  {onShare && (
                    <button type="button" onClick={handleShareClick} className="px-2 py-3 flex flex-col items-center justify-center gap-1 text-center text-sm text-amber-800 hover:bg-amber-100 active:bg-amber-200 transition-colors min-h-[44px]">
                      <ShareIcon className="w-5 h-5" />
                      <span className="font-medium">Partager</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </BaseCard.Content>
    </BaseCard>

    {/* Lightbox - rendu en dehors de la carte pour être plein écran */}
    {hasMedia && lightboxIndex !== null && (
      <ProgressMedia
        medias={progress.medias}
        maxPhotos={progress.medias.length}
        initialLightboxIndex={lightboxIndex}
        onLightboxClose={() => setLightboxIndex(null)}
        onLightboxOpen={(index: number) => setLightboxIndex(index)}
        showThumbnails={false}
        title={progress.content}
      />
    )}
    </div>
  );
}
