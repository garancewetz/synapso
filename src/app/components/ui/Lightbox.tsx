'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { CloseIcon, ArrowLeftIcon, ArrowRightIcon } from '@/app/components/ui/icons';
import { useBodyScrollLock } from '@/app/hooks/useBodyScrollLock';

type Props = {
  images: { url: string; alt?: string }[];
  currentIndex: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  title?: string;
};

type TouchState = {
  startX: number;
  startY: number;
  startDistance: number;
  startScale: number;
  startTranslateX: number;
  startTranslateY: number;
  lastTap: number;
  isSwiping: boolean;
  isPinching: boolean;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SWIPE_THRESHOLD = 50;
const DOUBLE_TAP_DELAY = 300;

export function Lightbox({ images, currentIndex, onClose, onIndexChange, title }: Props) {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStateRef = useRef<TouchState>({
    startX: 0,
    startY: 0,
    startDistance: 0,
    startScale: 1,
    startTranslateX: 0,
    startTranslateY: 0,
    lastTap: 0,
    isSwiping: false,
    isPinching: false,
  });

  useBodyScrollLock(true);

  const resetZoom = useCallback(() => {
    setIsAnimating(true);
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
    setTimeout(() => setIsAnimating(false), 200);
  }, []);

  // Reset zoom quand on change d'image
  useEffect(() => {
    resetZoom();
  }, [currentIndex, resetZoom]);

  const goToNext = useCallback(() => {
    if (scale > 1) {
      resetZoom();
      return;
    }
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    onIndexChange?.(newIndex);
  }, [currentIndex, images.length, onIndexChange, scale, resetZoom]);

  const goToPrevious = useCallback(() => {
    if (scale > 1) {
      resetZoom();
      return;
    }
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    onIndexChange?.(newIndex);
  }, [currentIndex, images.length, onIndexChange, scale, resetZoom]);

  // Gestion du clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goToPrevious, goToNext]);

  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const clampTranslation = useCallback((tx: number, ty: number, currentScale: number) => {
    if (currentScale <= 1) {
      return { x: 0, y: 0 };
    }

    const container = containerRef.current;
    if (!container) return { x: tx, y: ty };

    const rect = container.getBoundingClientRect();
    const maxTranslateX = (rect.width * (currentScale - 1)) / 2;
    const maxTranslateY = (rect.height * (currentScale - 1)) / 2;

    return {
      x: Math.max(-maxTranslateX, Math.min(maxTranslateX, tx)),
      y: Math.max(-maxTranslateY, Math.min(maxTranslateY, ty)),
    };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touches = e.touches;
    const state = touchStateRef.current;

    if (touches.length === 1) {
      const now = Date.now();
      const touch = touches[0];

      // Double tap pour zoomer
      if (now - state.lastTap < DOUBLE_TAP_DELAY) {
        e.preventDefault();
        if (scale > 1) {
          resetZoom();
        } else {
          setIsAnimating(true);
          setScale(2);
          setTimeout(() => setIsAnimating(false), 200);
        }
        state.lastTap = 0;
        return;
      }

      state.lastTap = now;
      state.startX = touch.clientX;
      state.startY = touch.clientY;
      state.startTranslateX = translateX;
      state.startTranslateY = translateY;
      state.isSwiping = true;
      state.isPinching = false;
    } else if (touches.length === 2) {
      state.isPinching = true;
      state.isSwiping = false;
      state.startDistance = getDistance(touches[0], touches[1]);
      state.startScale = scale;
      state.startTranslateX = translateX;
      state.startTranslateY = translateY;
    }
  }, [scale, translateX, translateY, resetZoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touches = e.touches;
    const state = touchStateRef.current;

    if (touches.length === 2 && state.isPinching) {
      e.preventDefault();
      const newDistance = getDistance(touches[0], touches[1]);
      const scaleChange = newDistance / state.startDistance;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, state.startScale * scaleChange));
      setScale(newScale);

      const centerX = (touches[0].clientX + touches[1].clientX) / 2;
      const centerY = (touches[0].clientY + touches[1].clientY) / 2;
      const container = containerRef.current;

      if (container) {
        const rect = container.getBoundingClientRect();
        const offsetX = centerX - rect.width / 2;
        const offsetY = centerY - rect.height / 2;

        const newTranslateX = state.startTranslateX + offsetX * (1 - scaleChange);
        const newTranslateY = state.startTranslateY + offsetY * (1 - scaleChange);

        const clamped = clampTranslation(newTranslateX, newTranslateY, newScale);
        setTranslateX(clamped.x);
        setTranslateY(clamped.y);
      }
    } else if (touches.length === 1 && state.isSwiping && scale > 1) {
      e.preventDefault();
      const touch = touches[0];
      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;
      const newTranslateX = state.startTranslateX + deltaX;
      const newTranslateY = state.startTranslateY + deltaY;
      const clamped = clampTranslation(newTranslateX, newTranslateY, scale);
      setTranslateX(clamped.x);
      setTranslateY(clamped.y);
    }
  }, [scale, clampTranslation]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const state = touchStateRef.current;

    if (state.isPinching) {
      state.isPinching = false;
      if (scale < 1) {
        resetZoom();
      }
      return;
    }

    if (state.isSwiping && scale === 1 && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;

      // Swipe horizontal pour navigation
      if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          goToPrevious();
        } else {
          goToNext();
        }
      }

      // Swipe vers le bas pour fermer
      if (deltaY > SWIPE_THRESHOLD * 2 && Math.abs(deltaY) > Math.abs(deltaX)) {
        onClose();
      }
    }

    state.isSwiping = false;
  }, [scale, goToPrevious, goToNext, onClose, resetZoom]);

  const handleNavClick = useCallback((e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  }, []);

  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  const hasMultipleImages = images.length > 1;
  const showNavigation = hasMultipleImages && scale === 1;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center touch-none"
      role="dialog"
      aria-modal="true"
      aria-label={`Visualiseur d'image - Photo ${currentIndex + 1} sur ${images.length}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95" aria-hidden="true" />

      {/* Titre */}
      {title && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-16 md:px-20">
          <h2 className="text-white text-lg font-semibold bg-black/50 px-6 py-3 rounded-lg text-center truncate">
            {title}
          </h2>
        </div>
      )}

      {/* Bouton fermer */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 left-4 flex items-center justify-center text-white p-4 rounded-full bg-black/60 hover:bg-black/70 active:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white z-30"
        aria-label="Fermer la visionneuse"
      >
        <CloseIcon className="w-8 h-8" />
      </button>

      {/* Indicateur de zoom */}
      {scale > 1 && (
        <div className="absolute top-4 right-4 z-30 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
          {Math.round(scale * 100)}%
        </div>
      )}

      {/* Zone de l'image avec gestes tactiles */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={onClose}
      >
        {/* Navigation précédente */}
        {showNavigation && (
          <button
            type="button"
            onClick={(e) => handleNavClick(e, goToPrevious)}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white p-4 md:p-3 rounded-full bg-black/60 hover:bg-black/70 active:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white z-20"
            aria-label="Photo précédente"
          >
            <ArrowLeftIcon className="w-8 h-8 md:w-6 md:h-6" />
          </button>
        )}

        {/* Image */}
        <div
          className={clsx(
            'relative max-w-[85vw] max-h-[85vh]',
            title && 'mt-16',
            hasMultipleImages && 'mx-16 md:mx-20'
          )}
          style={{
            transform: `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`,
            transition: isAnimating ? 'transform 0.2s ease-out' : 'none',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={currentImage.url}
            alt={currentImage.alt || `Photo ${currentIndex + 1} sur ${images.length}`}
            className="max-w-full max-h-[85vh] object-contain select-none"
            draggable={false}
          />
        </div>

        {/* Navigation suivante */}
        {showNavigation && (
          <button
            type="button"
            onClick={(e) => handleNavClick(e, goToNext)}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white p-4 md:p-3 rounded-full bg-black/60 hover:bg-black/70 active:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white z-20"
            aria-label="Photo suivante"
          >
            <ArrowRightIcon className="w-8 h-8 md:w-6 md:h-6" />
          </button>
        )}
      </div>

      {/* Indicateur de position */}
      {hasMultipleImages && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="text-white text-base font-medium bg-black/60 px-4 py-2 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
