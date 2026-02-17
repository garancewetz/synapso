'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Progress } from '@/app/types';
import { CloseIcon, ArrowLeftIcon, ArrowRightIcon } from '@/app/components/ui/icons';
import { useBodyScrollLock } from '@/app/hooks/useBodyScrollLock';
import {
  ProgressSlideshowSlide,
  type ProgressSlide,
} from './ProgressSlideshowSlide';

const SLIDE_DURATION_MS = 5500;

function buildSlides(progressList: Progress[]): ProgressSlide[] {
  const slides: ProgressSlide[] = [];
  progressList.forEach((progress, index) => {
    const victoryNumber = progressList.length - index;
    if (progress.medias && progress.medias.length > 0) {
      progress.medias.forEach((url) => {
        slides.push({ type: 'progress', progress, mediaUrl: url, victoryNumber });
      });
    } else {
      slides.push({ type: 'progress', progress, victoryNumber });
    }
  });
  slides.push({ type: 'closing' });
  return slides;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  progressList: Progress[];
};

export function ProgressSlideshow({ isOpen, onClose, progressList }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = useMemo(() => buildSlides(progressList), [progressList]);
  const total = slides.length;

  useBodyScrollLock(isOpen);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i >= total - 1 ? i : i + 1));
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i <= 0 ? 0 : i - 1));
  }, []);

  const handleSlideAreaClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x < rect.width / 2) {
        goPrev();
      } else {
        goNext();
      }
    },
    [goPrev, goNext]
  );

  useEffect(() => {
    if (!isOpen || total === 0 || !isPlaying) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((i) => {
        if (i >= total - 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return i;
        }
        return i + 1;
      });
    }, SLIDE_DURATION_MS);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen, total, isPlaying]);

  useEffect(() => {
    if (!isOpen || total === 0 || currentIndex !== total - 1) return;
    const timeout = setTimeout(onClose, SLIDE_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [isOpen, total, currentIndex, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goNext();
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, goPrev, goNext]);

  useEffect(() => {
    if (isOpen) setCurrentIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      containerRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen || progressList.length === 0) return null;

  const currentSlide = slides[currentIndex];
  const isLastSlide = currentIndex === total - 1;

  const content = (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Diaporama de tes progrès"
      tabIndex={-1}
      className="fixed inset-0 z-[9999] flex flex-col bg-black touch-none"
    >
      <div
        className="relative flex-1 min-h-0 cursor-pointer"
        onClick={handleSlideAreaClick}
      >
        {currentSlide && <ProgressSlideshowSlide slide={currentSlide} />}
      </div>

      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-black/80 text-white shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Fermer le diaporama"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="p-2 rounded-full hover:bg-white/20 disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Slide précédente"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="px-3 py-1.5 text-sm rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={isPlaying ? 'Mettre en pause' : 'Reprendre'}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={isLastSlide}
            className="p-2 rounded-full hover:bg-white/20 disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Slide suivante"
          >
            <ArrowRightIcon className="w-6 h-6" />
          </button>
        </div>

        <span className="text-sm font-medium tabular-nums min-w-[4rem] text-right">
          {currentIndex + 1} / {total}
        </span>
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(content, document.body);
}
