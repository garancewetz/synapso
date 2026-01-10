'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useBodyScrollLock } from '@/app/hooks/useBodyScrollLock';
import { KEYBOARD_KEYS } from '@/app/constants/accessibility.constants';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Classe CSS supplémentaire pour le contenu */
  className?: string;
  /** Afficher le bouton fermer en bas (mobile) */
  showFooterClose?: boolean;
  /** Label du bouton fermer */
  closeLabel?: string;
};

// Seuil de drag pour fermer (en pixels)
const DRAG_CLOSE_THRESHOLD = 100;

/**
 * Composant de base pour les bottom sheets (mobile) / modals (desktop)
 * Gère les animations, le backdrop, le drag-to-close et le body scroll lock
 */
export default function BottomSheetModal({
  isOpen,
  onClose,
  children,
  className = '',
  showFooterClose = false,
  closeLabel = 'Fermer',
}: Props) {
  // Bloquer le scroll du body quand la modale est ouverte
  useBodyScrollLock(isOpen);

  // Gérer la touche Escape pour fermer la modale
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_KEYS.ESCAPE) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape, true);

    return () => {
      document.removeEventListener('keydown', handleEscape, true);
    };
  }, [isOpen, onClose]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > DRAG_CLOSE_THRESHOLD || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-60 flex items-end md:items-center justify-center md:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 md:bg-black/50"
            onClick={onClose}
            onTouchStart={(e) => {
              // Empêcher le double-tap zoom et améliorer la réactivité sur mobile
              e.preventDefault();
              onClose();
            }}
            style={{ touchAction: 'manipulation' }}
          />

          {/* Bottom Sheet (mobile) / Modal (desktop) */}
          <motion.div
            className={`relative bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${className}`}
            initial={{ y: '100%', scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: '100%', scale: 0.95 }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={handleDragEnd}
            style={{ touchAction: 'none' }}
          >
            {/* Poignée de glissement (mobile) */}
            <button
              type="button"
              onClick={onClose}
              className="w-full flex justify-center pt-3 pb-2 cursor-pointer hover:bg-gray-50 transition-colors md:hidden shrink-0"
              aria-label="Fermer"
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors" />
            </button>

            {/* Bouton fermer desktop */}
            <button
              type="button"
              onClick={onClose}
              className="hidden md:flex absolute top-3 right-3 w-8 h-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer z-50"
              aria-label="Fermer"
            >
              <span className="text-gray-500 text-lg">✕</span>
            </button>

            {/* Contenu */}
            {children}

            {/* Footer avec bouton fermer (mobile, optionnel) */}
            {showFooterClose && (
              <div className="px-5 py-4 bg-white border-t border-gray-100 md:hidden shrink-0">
                <button
                  onClick={onClose}
                  className="w-full py-4 px-4 rounded-2xl font-bold text-lg text-gray-700
                             bg-gray-100 hover:bg-gray-200 active:bg-gray-300
                             transition-all active:scale-[0.98] cursor-pointer"
                >
                  {closeLabel}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

