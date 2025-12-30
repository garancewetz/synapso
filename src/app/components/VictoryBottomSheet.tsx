'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { CATEGORY_ORDER, CATEGORY_ICONS, CATEGORY_LABELS_SHORT } from '@/app/constants/exercice.constants';
import { VICTORY_TAGS, VICTORY_CATEGORY_COLORS } from '@/app/constants/victory.constants';
import { useBodyScrollLock } from '@/app/hooks/useBodyScrollLock';
import type { ExerciceCategory } from '@/app/types/exercice';
import type { Victory } from '@/app/types';

interface VictoryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
  victoryToEdit?: Victory | null;
}

// Seuil de drag pour fermer (en pixels)
const DRAG_CLOSE_THRESHOLD = 100;

export default function VictoryBottomSheet({ isOpen, onClose, onSuccess, userId, victoryToEdit }: VictoryBottomSheetProps) {
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciceCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const isEditMode = !!victoryToEdit;

  // Bloquer le scroll du body quand la modale est ouverte
  useBodyScrollLock(isOpen);

  // Pré-remplir les champs en mode édition
  useEffect(() => {
    if (isOpen && victoryToEdit) {
      setContent(victoryToEdit.content);
      const categoryFromEmoji = CATEGORY_ORDER.find(
        cat => CATEGORY_ICONS[cat] === victoryToEdit.emoji
      );
      setSelectedCategory(categoryFromEmoji || null);
    } else if (!isOpen) {
      setContent('');
      setSelectedCategory(null);
    }
  }, [isOpen, victoryToEdit]);

  // Vérifier si la reconnaissance vocale est supportée
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setContent(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setError('Autorise le micro pour utiliser la dictée vocale');
      }
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Clique sur un tag ou écris quelque chose !');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const categoryEmoji = selectedCategory ? CATEGORY_ICONS[selectedCategory] : null;

    try {
      const url = isEditMode ? `/api/victories/${victoryToEdit!.id}` : '/api/victories';
      
      const response = await fetch(url, {
        method: isEditMode ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: content.trim(),
          emoji: categoryEmoji,
          ...(isEditMode ? {} : { userId }),
        }),
      });

      if (response.ok) {
        resetForm();
        onSuccess();
        handleClose();
      } else {
        setError('Oups, une erreur est survenue. Réessaie !');
      }
    } catch {
      setError('Erreur de connexion. Vérifie ta connexion internet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setSelectedCategory(null);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > DRAG_CLOSE_THRESHOLD || info.velocity.y > 500) {
      handleClose();
    }
  };

  const handleTagClick = (label: string) => {
    const isActive = content.includes(label);
    if (isActive) {
      setContent(prev => prev.replace(label, '').replace(/\s+/g, ' ').trim());
    } else {
      setContent(prev => prev ? `${prev} ${label}` : label);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[60] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" />
          
          {/* Bottom Sheet */}
          <motion.div 
            className="relative bg-white w-full max-w-lg rounded-t-3xl shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={handleDragEnd}
            style={{ touchAction: 'none' }}
          >
            {/* Poignée de glissement - clic pour fermer */}
            <button
              type="button"
              onClick={handleClose}
              className="w-full flex justify-center pt-3 pb-2 cursor-pointer hover:bg-gray-50 transition-colors"
              aria-label="Fermer"
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors" />
            </button>

            {/* Titre */}
            <div className="text-center pb-3">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditMode ? 'Modifier ta victoire ✏️' : 'Ta victoire ! 🌟'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="px-5 pb-8">
              {/* Tags de victoire */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {VICTORY_TAGS.map(({ label, emoji }) => {
                  const isActive = content.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleTagClick(label)}
                      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl
                                 transition-all duration-150 active:scale-95
                                 ${isActive 
                                   ? 'bg-emerald-500 text-white shadow-lg scale-[1.02]' 
                                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                 }`}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-xs font-semibold">{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Zone de texte avec micro */}
              <div className="mb-4">
                <div className="relative">
                  <textarea
                    id="victory-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-2xl 
                               focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 
                               resize-none text-gray-800 placeholder:text-gray-400 transition-all
                               ${isListening ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    placeholder="Ajoute des détails (optionnel)..."
                    rows={2}
                    maxLength={500}
                  />
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={toggleSpeechRecognition}
                      className={`absolute right-2 top-2 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isListening 
                          ? 'bg-red-500 text-white animate-pulse shadow-lg' 
                          : 'bg-gray-100 hover:bg-amber-100 text-gray-500 hover:text-amber-700'
                      }`}
                      aria-label={isListening ? 'Arrêter' : 'Dicter'}
                    >
                      <span className="text-base">{isListening ? '⏹️' : '🎤'}</span>
                    </button>
                  )}
                </div>
                {isListening && (
                  <p className="text-xs text-red-500 font-medium mt-1 text-center">
                    🔴 Écoute en cours...
                  </p>
                )}
              </div>

              {/* Catégories */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 text-center mb-2">Zone travaillée (optionnel)</p>
                <div className="flex justify-center gap-3">
                  {CATEGORY_ORDER.map((category) => {
                    const emoji = CATEGORY_ICONS[category];
                    const label = CATEGORY_LABELS_SHORT[category];
                    const colors = VICTORY_CATEGORY_COLORS[category];
                    const isSelected = selectedCategory === category;
                    
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(isSelected ? null : category)}
                        className="flex flex-col items-center gap-1 transition-all duration-150"
                      >
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center
                          transition-all duration-150
                          ${isSelected ? `${colors.active} scale-110` : `${colors.inactive} hover:scale-105`}
                        `}>
                          <span className="text-xl">{emoji}</span>
                        </div>
                        <span className={`text-[10px] font-medium ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-4 px-4 rounded-2xl font-semibold text-gray-600 
                             bg-gray-100 hover:bg-gray-200
                             transition-all active:scale-[0.98]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="flex-1 py-4 px-4 rounded-2xl font-bold text-amber-950 
                             bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 
                             shadow-md hover:shadow-lg
                             transition-all active:scale-[0.98]
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="animate-spin">⏳</span>
                  ) : isEditMode ? (
                    <>
                      <span>✅</span>
                      Modifier
                    </>
                  ) : (
                    <>
                      <span>🎉</span>
                      Célébrer !
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
