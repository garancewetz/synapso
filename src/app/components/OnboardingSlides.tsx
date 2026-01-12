'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/app/components/ui/Button';
import ProgressButton from '@/app/components/ProgressButton';
import AddButton from '@/app/components/ui/AddButton';
import { MenuLink } from '@/app/components/MenuLink';
import { ChevronIcon, PlusIcon, UserIcon, MapIcon } from '@/app/components/ui/icons';
import Logo from '@/app/components/ui/Logo';
import { CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import { CategoryCardWithProgress } from '@/app/components/CategoryCardWithProgress';
import { MENU_COLORS } from '@/app/constants/card.constants';
import { SITEMAP_ICON_STYLES } from '@/app/constants/sitemap.constants';
import { useUser } from '@/app/contexts/UserContext';
import { useOnboarding } from '@/app/hooks/useOnboarding';
import { useBodyScrollLock } from '@/app/hooks/useBodyScrollLock';
import { KEYBOARD_KEYS } from '@/app/constants/accessibility.constants';
import { getOnboardingSlides } from '@/app/constants/onboarding.constants';
import {
  ScreenshotFrame,
  HighlightZone,
  ExerciceCardSkeleton,
  TransitionArrow,
} from '@/app/components/onboarding/ui';
import clsx from 'clsx';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** Si true, l'onboarding sera marqué comme vu à la fermeture */
  markAsSeenOnClose?: boolean;
};

export function OnboardingSlides({ isOpen, onClose, markAsSeenOnClose = false }: Props) {
  const { effectiveUser } = useUser();
  const { markAsSeen } = useOnboarding();
  const isAphasic = effectiveUser?.isAphasic ?? false;
  
  const slides = getOnboardingSlides(isAphasic);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Bloquer le scroll du body
  useBodyScrollLock(isOpen);

  // Réinitialiser à la première slide quand on ouvre
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
    }
  }, [isOpen]);

  const handleNext = useCallback(() => {
    setCurrentSlide(prev => {
      if (prev < slides.length - 1) {
        return prev + 1;
      }
      // Dernière slide : on retourne la même valeur et on ferme après le rendu
      setTimeout(() => {
        if (markAsSeenOnClose) {
          markAsSeen();
        }
        onClose();
      }, 0);
      return prev;
    });
  }, [slides.length, markAsSeenOnClose, markAsSeen, onClose]);

  const handlePrevious = useCallback(() => {
    setCurrentSlide(prev => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleClose = useCallback(() => {
    // Décaler l'appel pour éviter l'erreur React
    setTimeout(() => {
      if (markAsSeenOnClose) {
        markAsSeen();
      }
      onClose();
    }, 0);
  }, [markAsSeenOnClose, markAsSeen, onClose]);

  // Navigation clavier
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_KEYS.ESCAPE) {
        handleClose();
      } else if (e.key === KEYBOARD_KEYS.ARROW_LEFT) {
        handlePrevious();
      } else if (e.key === KEYBOARD_KEYS.ARROW_RIGHT || e.key === KEYBOARD_KEYS.ENTER) {
        handleNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, handlePrevious, handleNext]);

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen) return null;

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  return (
    <div className="fixed inset-0 z-60 bg-white">
      {/* Contenu plein écran */}
      <motion.div
        className="h-full w-full flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {/* Bouton fermer */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 cursor-pointer z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
          aria-label="Fermer"
        >
          <span className="text-gray-500 text-xl">✕</span>
        </button>

        {/* Contenu - Plein écran */}
        <div className="flex-1 flex flex-col items-center justify-center px-3 sm:p-6 md:p-12 text-center min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full max-w-2xl mx-auto"
            >
                  {/* Titre */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6 md:mb-8 leading-tight">
                {slide.title}
              </h2>

              {/* Contenu */}
              <p className="text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-6 md:mb-8">
                {slide.content}
              </p>

              {/* Visuels spécifiques */}
              <div className="mb-8 md:mb-12">
                {slide.visual === 'welcome' && (
                  <div className="relative flex items-center justify-center mb-6 min-h-[200px] md:min-h-[250px]">
                    <div className="relative z-10">
                      <Logo size={100} className="md:scale-125" />
                    </div>
            
                  </div>
                )}

                {slide.visual === 'categories' && (
                  <div className="relative mb-6 pointer-events-none max-w-2xl mx-auto overflow-visible">
                    <ScreenshotFrame headerWidth="32" overflowVisible>
                      {/* Grille de catégories */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        {CATEGORY_ORDER.map((category, index) => (
                          <div key={category} className="relative pointer-events-none [&_a]:pointer-events-none [&_a]:cursor-default [&>a>div>div:last-child]:hidden [&_h3]:text-left [&_p]:text-left [&>a>div>div:first-child>div:last-child]:hidden">
                            {/* Annotation avec numéro */}
                            <div className="absolute top-2 left-2 sm:-top-3 sm:-left-3 z-20 flex items-center gap-1 bg-amber-500 rounded-full px-2.5 py-1 shadow-lg">
                              <span className="text-white font-bold text-sm md:text-base">{index + 1}</span>
                            </div>
                            <HighlightZone color="amber" shape="rect" inset="sm" />
                            <CategoryCardWithProgress
                              category={category}
                              total={3}
                              completedCount={index}
                            />
                          </div>
                        ))}
                      </div>
                    </ScreenshotFrame>
                  </div>
                )}

                {slide.visual === 'add-exercice' && (
                  <div className="relative mb-6 pointer-events-none max-w-2xl mx-auto overflow-visible">
                    <ScreenshotFrame headerWidth="40" minHeight="300" overflowVisible>
                      {/* Option 1 : Menu dans le contexte */}
                      <div className="mb-6 relative">
                        {/* Annotation - repositionnée pour mobile */}
                        <div className="absolute -top-8 left-0 sm:-left-12 sm:top-1/2 sm:-translate-y-1/2 z-20">
                          <div className="bg-amber-500 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-lg font-semibold text-xs sm:text-sm whitespace-nowrap">
                            Option 1
                          </div>
                        </div>
                        <HighlightZone color="amber" shape="rect" inset="sm" />
                        <MenuLink
                          href="#"
                          icon={<PlusIcon className="w-5 h-5" />}
                          title="Ajouter un exercice"
                          iconBgColor={MENU_COLORS.ADD_EXERCICE.bg}
                          iconTextColor={MENU_COLORS.ADD_EXERCICE.text}
                        />
                      </div>
                      
                      {/* Séparateur */}
                      <div className="text-center text-gray-400 text-lg mb-6">ou</div>
                      
                      {/* Option 2 : Bouton flottant en bas à droite */}
                      <div className="relative flex justify-end">
                        {/* Annotation - repositionnée pour mobile */}
                        <div className="absolute -top-8 right-0 sm:-right-16 sm:top-1/2 sm:-translate-y-1/2 z-20">
                          <div className="bg-amber-500 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-lg font-semibold text-xs sm:text-sm whitespace-nowrap">
                            Option 2
                          </div>
                        </div>
                        <HighlightZone color="amber" shape="circle" inset="sm" />
                        <AddButton
                          href="#"
                          label="Ajouter un exercice"
                          className="pointer-events-none"
                        />
                      </div>
                    </ScreenshotFrame>
                  </div>
                )}

                {slide.visual === 'completion' && (
                  <div className="relative mb-6 pointer-events-none max-w-2xl mx-auto">
                    {/* Capture d'écran simulée - Avant */}
                    <ScreenshotFrame headerWidth="48" className="mb-4">
                      <ExerciceCardSkeleton buttonState="notDone" />
                    </ScreenshotFrame>
                    
                    {/* Flèche de transition */}
                    <TransitionArrow />
                    
                    {/* Capture d'écran simulée - Après */}
                    <ScreenshotFrame headerWidth="48">
                      <ExerciceCardSkeleton buttonState="done" />
                    </ScreenshotFrame>
                  </div>
                )}

                {slide.visual === 'progress' && (
                  <div className="relative mb-6 pointer-events-none max-w-2xl mx-auto overflow-visible">
                    <ScreenshotFrame headerWidth="40" minHeight="400" overflowVisible className="relative">
                      {/* Contenu de page simulé */}
                      <div className="space-y-3 mb-8">
                        <div className="h-20 bg-gray-50 rounded-lg border border-gray-200" />
                        <div className="h-20 bg-gray-50 rounded-lg border border-gray-200" />
                        <div className="h-20 bg-gray-50 rounded-lg border border-gray-200" />
                      </div>
                      
                      {/* Bouton flottant en bas à droite avec annotation */}
                      <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 z-20">
                        {/* Annotation - repositionnée pour mobile */}
                        <div className="absolute top-0 left-0 -translate-x-full -translate-y-full mb-2 sm:-top-16 sm:-left-20 sm:mb-0 sm:translate-x-0 sm:translate-y-0 z-30">
                          <div className="bg-amber-500 text-white px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg shadow-lg font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap">
                            Ce bouton apparaît ici
                          </div>
                        </div>
                        <div className="absolute inset-0 sm:-inset-3 border-4 border-amber-500 rounded-full pointer-events-none z-10 animate-pulse" />
                        <ProgressButton
                          onClick={() => {}}
                          variant="inline"
                          position="right"
                        />
                      </div>
                    </ScreenshotFrame>
                  </div>
                )}

                {slide.visual === 'aphasie' && (
                  <div className="relative mb-6 pointer-events-none max-w-2xl mx-auto">
                    <ScreenshotFrame headerWidth="40">
                      {/* Formulaire simulé */}
                      <div className="space-y-4">
                        <div>
                          <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse" />
                          <div className="h-12 bg-gray-50 border-2 border-gray-200 rounded-lg" />
                        </div>
                        <div>
                          <div className="h-4 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
                          <div className="h-24 bg-gray-50 border-2 border-gray-200 rounded-lg" />
                        </div>
                        
                        {/* Bouton micro avec annotation */}
                        <div className="relative flex justify-end">
                          {/* Annotation avec flèche - repositionnée pour mobile */}
                          <div className="absolute top-0 right-0 -translate-x-full -translate-y-full mb-2 sm:-right-24 sm:top-1/2 sm:-translate-y-1/2 sm:mb-0 sm:translate-x-0 z-20 flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2">
                            <svg
                              className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 sm:mb-2 order-first sm:order-last"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                              aria-hidden="true"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 13l-5-5m0 0l5-5m-5 5h12" />
                            </svg>
                            <div className="bg-amber-500 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-lg font-semibold text-xs sm:text-sm whitespace-nowrap">
                              Micro pour dicter
                            </div>
                          </div>
                          <HighlightZone color="amber" shape="rect" inset="sm" />
                          <button
                            type="button"
                            className="w-12 h-12 bg-amber-100 hover:bg-amber-200 rounded-full flex items-center justify-center border-2 border-amber-300 transition-colors pointer-events-none"
                            aria-label="Activer la dictée vocale"
                          >
                            <svg
                              className="w-6 h-6 text-amber-700"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </ScreenshotFrame>
                  </div>
                )}

                {slide.visual === 'settings' && (
                  <div className="flex items-center justify-center mb-6 max-w-md mx-auto pointer-events-none">
                    <div className="w-full">
                      <MenuLink
                        href="#"
                        icon={<UserIcon className="w-5 h-5" />}
                        title="Mon profil"
                        description="Gérer mon profil et mes préférences"
                        iconBgColor={SITEMAP_ICON_STYLES.primary.settings.bg}
                        iconTextColor={SITEMAP_ICON_STYLES.primary.settings.text}
                      />
                    </div>
                  </div>
                )}

                {slide.visual === 'history' && (
                  <div className="flex items-center justify-center mb-6 max-w-md mx-auto pointer-events-none">
                    <div className="w-full">
                      <MenuLink
                        href="#"
                        icon={<MapIcon className="w-5 h-5" />}
                        title="Mon parcours"
                        description="Voir mon historique et mes statistiques"
                        iconBgColor={SITEMAP_ICON_STYLES.primary.parcours.bg}
                        iconTextColor={SITEMAP_ICON_STYLES.primary.parcours.text}
                      />
                    </div>
                  </div>
                )}

                {slide.visual === 'celebration' && (
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl  flex items-center justify-center shadow-lg">
                      <span className="text-6xl md:text-7xl">🎉</span>
                    </div>
                  </div>
                )}
              </div>

            
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation - Fixée en bas */}
        <div className="border-t border-gray-200 p-4 md:p-6 bg-white shrink-0">
          {/* Indicateur de progression */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {slides.map((_, index) => (
              <div
                key={index}
                className={clsx(
                  'h-2 rounded-full transition-all duration-200',
                  index === currentSlide
                    ? 'w-8 bg-amber-500'
                    : 'w-2 bg-gray-300'
                )}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Compteur */}
          <div className="text-center text-sm text-gray-500 mb-4">
            {currentSlide + 1} / {slides.length}
          </div>

          {/* Boutons */}
          <div className="flex items-stretch justify-between gap-3 max-w-2xl mx-auto">
            {/* Bouton Précédent */}
            <Button
              type="button"
              variant="secondary"
              onClick={handlePrevious}
              disabled={isFirstSlide}
              className="flex-1 min-w-[120px] min-h-[44px] justify-center"
            >
              <ChevronIcon direction="left" className="w-4 h-4" />
              <span className="hidden sm:inline">Précédent</span>
            </Button>

            {/* Bouton Passer (première slide uniquement) */}
            {isFirstSlide && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleSkip}
                className="flex-1 min-w-[120px] min-h-[44px] justify-center"
              >
                Passer
              </Button>
            )}

            {/* Bouton Suivant / Commencer */}
            <Button
              type="button"
              onClick={handleNext}
              className={clsx(
                'flex-1 min-w-[120px] min-h-[44px] justify-center',
                isLastSlide && 'bg-amber-500 hover:bg-amber-600 text-white'
              )}
            >
              {isLastSlide ? (
                <>
                  <span>Commencer</span>
                  <span>🚀</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Suivant</span>
                  <ChevronIcon direction="right" className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

