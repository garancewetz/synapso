'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Progress } from '@/app/types';
import { EditIcon, EyeIcon, ChevronIcon } from '@/app/components/ui/icons';
import { BaseCard, Button } from '@/app/components/ui';
import { ShareIcon } from '@/app/components/ui/icons';
import { useShareProgress } from '@/app/hooks/useShareProgress';
import { formatVictoryDate } from '@/app/utils/date.utils';
import { getExerciceCategoryFromEmoji, isOrthophonieProgress } from '@/app/utils/progress.utils';
import { CATEGORY_LABELS_SHORT } from '@/app/constants/exercice.constants';
import { GOLDEN_TEXT_STYLES } from '@/app/constants/card.constants';
import clsx from 'clsx';
import { useUser } from '@/app/contexts/UserContext';
import { ProgressMedia } from '@/app/components/ProgressMedia';

type Props = {
  progress: Progress;
  onEdit?: (progress: Progress) => void;
  onShare?: (progress: Progress) => void;
  compact?: boolean;
};

/**
 * Carte de progrès individuelle - Version simplifiée
 * Style doré avec étoile, affichage minimaliste pour vue d'ensemble rapide
 * Principe : minimiser la charge cognitive, maximiser l'encouragement
 */
export function ProgressCard({ progress, onEdit, onShare, compact = false }: Props) {
  const { effectiveUser } = useUser();
  const cardRef = useRef<HTMLDivElement>(null);
  const { handleShare } = useShareProgress(progress, cardRef);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
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
    if (onEdit) {
      onEdit(progress);
    }
  }, [onEdit, progress]);

  // Handler de partage
  const handleShareClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleShare();
    if (onShare) {
      onShare(progress);
    }
  }, [handleShare, onShare, progress]);

  // Toggle expandable
  const toggleExpand = useCallback(() => {
    if (hasMedia) {
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
  
  
  return (
    <div ref={cardRef} className="relative">
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
        
        {/* Footer avec boutons d'action en bas */}
        {(onEdit || onShare) && (
          <BaseCard.Footer>
            <div className={clsx(
              'flex gap-2',
              effectiveUser?.dominantHand === 'LEFT' ? 'flex-row-reverse' : 'flex-row',
              effectiveUser?.dominantHand === 'LEFT' ? 'justify-start' : 'justify-end'
            )}>
              {onShare && (
                <Button
                  variant="golden"
                  size="sm"
                  icon={<ShareIcon className="w-4 h-4" />}
                  onClick={handleShareClick}
                  aria-label={`Partager ce progrès : ${progress.content}`}
                >
                  Partager
                </Button>
              )}
              {onEdit && (
                <Button
                  iconOnly
                  onClick={handleEdit}
                  title="Modifier"
                  aria-label="Modifier ce progrès"
                >
                  <EditIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          </BaseCard.Footer>
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

