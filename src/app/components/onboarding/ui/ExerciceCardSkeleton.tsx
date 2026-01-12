'use client';

import { CompleteButton } from '@/app/components/ui/CompleteButton';
import { AnnotationBadge } from './AnnotationBadge';
import { HighlightZone } from './HighlightZone';

type Props = {
  /** État du bouton */
  buttonState: 'notDone' | 'done';
  /** Si true, affiche l'annotation au-dessus du bouton */
  showAnnotation?: boolean;
};

/**
 * Skeleton de carte d'exercice pour l'onboarding
 * Simule une vraie carte d'exercice avec bouton de complétion
 */
export function ExerciceCardSkeleton({ buttonState, showAnnotation = true }: Props) {
  const isDone = buttonState === 'done';
  const color = isDone ? 'emerald' : 'amber';
  const label = isDone ? 'Fait' : 'Non fait';

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
      {/* Contenu */}
      <div className="p-4">
        <div className="h-5 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
        <div className="h-4 w-48 bg-gray-100 rounded mb-3" />
        <div className="flex gap-1.5">
          <div className="h-6 w-16 bg-gray-100 rounded" />
          <div className="h-6 w-20 bg-gray-100 rounded" />
        </div>
      </div>
      {/* Footer avec bouton */}
      <div className="bg-gray-50/70 border-t border-gray-100 px-4 py-3 flex items-center justify-end gap-2 relative">
        {showAnnotation && (
          <>
            <AnnotationBadge
              label={label}
              color={color}
              arrowDirection="up"
              position="top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-1 sm:-top-8 sm:mb-0"
            />
            <HighlightZone color={color} shape="rect" inset="none" />
          </>
        )}
        <CompleteButton
          isCompleted={isDone}
          isCompletedToday={isDone}
          className="pointer-events-none cursor-default"
          disabled
        />
      </div>
    </div>
  );
}

