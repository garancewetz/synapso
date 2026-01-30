'use client';

import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { CATEGORY_ORDER, CATEGORY_ICONS, CATEGORY_LABELS_SHORT } from '@/app/constants/exercice.constants';
import { PROGRESS_TAGS, PROGRESS_CATEGORY_COLORS, ORTHOPHONIE_COLORS } from '@/app/constants/progress.constants';
import { PROGRESS_EMOJIS, CATEGORY_EMOJIS, ORTHOPHONIE_PROGRESS_EMOJI } from '@/app/constants/emoji.constants';
import { getExerciceCategoryFromEmoji, isOrthophonieProgress } from '@/app/utils/progress.utils';
import { useSpeechRecognition } from '@/app/hooks/useSpeechRecognition';
import { BottomSheetModal, Button } from '@/app/components/ui';
import { useDeleteConfirmation } from '@/app/hooks/useDeleteConfirmation';
import { ErrorMessage } from '@/app/components/ErrorMessage';
import { useUser } from '@/app/contexts/UserContext';
import { MediaUploaderProgress } from './MediaUploaderProgress';
import type { ExerciceCategory } from '@/app/types/exercice';
import type { Progress } from '@/app/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
  progressToEdit?: Progress | null;
  defaultCategory?: ProgressCategory;
  initialContent?: string; // Contenu initial pour la création (ex: depuis une tâche complétée)
  initialEmoji?: string; // Emoji initial pour la création
};

type ProgressCategory = ExerciceCategory | 'ORTHOPHONIE';

export function ProgressBottomSheet({ isOpen, onClose, onSuccess, userId, progressToEdit, defaultCategory, initialContent, initialEmoji }: Props) {
  const { effectiveUser } = useUser();
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMedias, setSelectedMedias] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProgressCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const deleteConfirmation = useDeleteConfirmation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const isEditMode = !!progressToEdit;

  // Hook de reconnaissance vocale
  const { isListening, isSupported: speechSupported, interimTranscript, toggleListening } = useSpeechRecognition({
    onResult: (transcript) => {
      setContent(prev => prev ? `${prev} ${transcript}` : transcript);
    },
    onError: setError,
  });

  // Valeur affichée = valeur réelle + texte en cours de reconnaissance
  const displayContent = isListening && interimTranscript 
    ? (content ? `${content} ${interimTranscript}` : interimTranscript)
    : content;

  // Auto-resize du textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [displayContent]);

  // Pré-remplir les champs en mode édition ou avec defaultCategory/initialContent
  useEffect(() => {
    if (isOpen && progressToEdit) {
      setContent(progressToEdit.content);
      setSelectedTags(progressToEdit.tags || []);
      setSelectedMedias(progressToEdit.medias || []);
      // Utiliser les utilitaires factorisés pour déterminer la catégorie
      if (isOrthophonieProgress(progressToEdit.emoji)) {
        setSelectedCategory('ORTHOPHONIE');
      } else {
        const categoryFromEmoji = getExerciceCategoryFromEmoji(progressToEdit.emoji);
        setSelectedCategory(categoryFromEmoji || null);
      }
    } else if (isOpen && initialContent) {
      // Pré-remplir avec le contenu initial (ex: depuis une tâche complétée)
      setContent(initialContent);
      setSelectedTags([]);
      setSelectedMedias([]);
      // Si un emoji initial est fourni, déterminer la catégorie
      if (initialEmoji) {
        if (initialEmoji === ORTHOPHONIE_PROGRESS_EMOJI) {
          setSelectedCategory('ORTHOPHONIE');
        } else {
          // Chercher la catégorie correspondant à l'emoji
          const categoryFromEmoji = getExerciceCategoryFromEmoji(initialEmoji);
          setSelectedCategory(categoryFromEmoji || null);
        }
      }
    } else if (isOpen && defaultCategory) {
      // Pré-sélectionner la catégorie par défaut si fournie
      setSelectedCategory(defaultCategory);
      setSelectedTags([]);
      setSelectedMedias([]);
    } else if (!isOpen) {
      setContent('');
      setSelectedTags([]);
      setSelectedMedias([]);
      setSelectedCategory(null);
    }
  }, [isOpen, progressToEdit, defaultCategory, initialContent, initialEmoji]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Le texte est obligatoire !');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Déterminer l'emoji selon la catégorie sélectionnée ou initialEmoji
    const categoryEmoji = initialEmoji 
      ? initialEmoji
      : selectedCategory === 'ORTHOPHONIE' 
        ? ORTHOPHONIE_PROGRESS_EMOJI 
        : selectedCategory 
          ? CATEGORY_ICONS[selectedCategory] 
          : null;

    try {
      const url = isEditMode ? `/api/progress/${progressToEdit!.id}` : '/api/progress';
      
      const response = await fetch(url, {
        method: isEditMode ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: content.trim(),
          emoji: categoryEmoji,
          tags: selectedTags,
          medias: selectedMedias,
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

  const handleDelete = async () => {
    if (!progressToEdit) return;

    try {
      const response = await fetch(`/api/progress/${progressToEdit.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        resetForm();
        onSuccess();
        handleClose();
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch {
      setError('Erreur lors de la suppression. Réessaie !');
    }
  };

  const resetForm = () => {
    setContent('');
    setSelectedTags([]);
    setSelectedMedias([]);
    setSelectedCategory(null);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTagClick = (label: string) => {
    setSelectedTags(prev => {
      if (prev.includes(label)) {
        return prev.filter(tag => tag !== label);
      } else {
        return [...prev, label];
      }
    });
  };

  return (
    <BottomSheetModal isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Titre */}
        <div className="text-center pb-3 md:pt-4 md:px-12 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Modifier ton progrès ✏️' : `Ton progrès ! ${PROGRESS_EMOJIS.STAR_BRIGHT}`}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-8 overflow-y-auto flex-1 min-h-0">
        {/* Zone de texte avec micro - OBLIGATOIRE */}
        <div className="mb-4">
          <label htmlFor="progress-content" className="block text-sm font-medium text-gray-700 mb-2">
            Ton progrès *
          </label>
          <div className="relative">
            <textarea
              id="progress-content"
              ref={textareaRef}
              value={displayContent}
              onChange={(e) => setContent(e.target.value)}
              className={`w-full px-3 py-2 pr-12 border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-amber-400 
                         overflow-hidden resize-none text-gray-800 placeholder:text-gray-400 transition-all
                         ${isListening ? 'border-red-400 bg-red-50' : ''}`}
              placeholder="Décris ton progrès..."
              rows={3}
              maxLength={500}
              required
            />
            {speechSupported && (
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute right-2 top-2 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
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
              🔴 Écoute en cours...{interimTranscript && ` "${interimTranscript}"`}
            </p>
          )}
        </div>

        {/* Tags de progrès - moins proéminents */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 text-center mb-2">Tags (optionnel)</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {PROGRESS_TAGS.map(({ label, emoji }) => {
              const isActive = selectedTags.includes(label);
              
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleTagClick(label)}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg cursor-pointer
                             transition-all duration-150 active:scale-95 text-xs
                             ${isActive 
                               ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                               : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                             }`}
                >
                  <span className="text-sm">{emoji}</span>
                  <span className="font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Médias */}
        <div className="mb-4">
          <MediaUploaderProgress
            value={selectedMedias}
            onChange={setSelectedMedias}
          />
        </div>

        {/* Catégories */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 text-center mb-2">Zone travaillée (optionnel)</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {/* Catégories physiques */}
            {CATEGORY_ORDER.map((category) => {
              const emoji = CATEGORY_ICONS[category];
              const label = CATEGORY_LABELS_SHORT[category];
              const colors = PROGRESS_CATEGORY_COLORS[category];
              const isSelected = selectedCategory === category;
              
              const handleCategoryClick = () => {
                // Toggle la sélection de la catégorie (ne modifie pas le textarea)
                setSelectedCategory(isSelected ? null : category);
              };
              
              return (
                <button
                  key={category}
                  type="button"
                  onClick={handleCategoryClick}
                  className="flex flex-col items-center gap-1 transition-all duration-150 cursor-pointer"
                >
                  <div className={clsx(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    'transition-all duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
                    'active:scale-[0.98]',
                    isSelected ? clsx(colors.active, 'ring-2 ring-offset-2 ring-gray-400') : clsx(colors.inactive, 'md:hover:ring-2 md:hover:ring-gray-300/50 md:hover:ring-offset-2')
                  )}>
                    <span className="text-xl">{emoji}</span>
                  </div>
                  <span className={`text-[10px] font-medium ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </button>
              );
            })}
            
            {/* Option Autre - à la fin avec couleur jaune (uniquement si l'utilisateur a le journal) */}
            {effectiveUser?.hasJournal && (
              <button
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === 'ORTHOPHONIE' ? null : 'ORTHOPHONIE')}
                className="flex flex-col items-center gap-1 transition-all duration-150 cursor-pointer"
              >
                <div className={clsx(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  'transition-all duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
                  'active:scale-[0.98]',
                  selectedCategory === 'ORTHOPHONIE' 
                    ? clsx(ORTHOPHONIE_COLORS.active, 'ring-2 ring-offset-2 ring-gray-400')
                    : clsx(ORTHOPHONIE_COLORS.inactive, 'md:hover:ring-2 md:hover:ring-gray-300/50 md:hover:ring-offset-2')
                )}>
                  <span className="text-xl">{CATEGORY_EMOJIS.ORTHOPHONIE}</span>
                </div>
                <span className={`text-[10px] font-medium ${selectedCategory === 'ORTHOPHONIE' ? 'text-gray-900' : 'text-gray-500'}`}>
                  Autre
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Message d'erreur */}
        <ErrorMessage message={error} className="mb-3 rounded-xl text-center text-sm" />

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className={clsx(
              'flex-1 py-4 px-4 rounded-2xl font-semibold text-gray-600',
              'bg-gray-100 md:hover:bg-gray-200',
              'md:hover:ring-2 md:hover:ring-gray-300/50 md:hover:ring-offset-2',
              'transition-all active:scale-[0.98] cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400'
            )}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className={clsx(
              'flex-1 py-4 px-4 rounded-2xl font-bold text-amber-950',
              'bg-linear-to-r from-amber-300 via-yellow-400 to-amber-500',
              'shadow-md md:hover:ring-2 md:hover:ring-amber-400/60 md:hover:ring-offset-2',
              'transition-all active:scale-[0.98]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-2 cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400'
            )}
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
                Noter !
              </>
            )}
          </button>
        </div>

        {/* Bouton supprimer (mode édition uniquement) */}
        {isEditMode && (
          <Button
            type="button"
            onClick={() => deleteConfirmation.handleClick(handleDelete)}
            disabled={isSubmitting || deleteConfirmation.isDeleting}
            variant={deleteConfirmation.showConfirm ? 'danger' : 'danger-outline'}
            size="md"
            rounded="lg"
            className="mt-3 w-full"
          >
            {deleteConfirmation.isDeleting ? (
              <span className="animate-spin">⏳</span>
            ) : deleteConfirmation.showConfirm ? (
              '⚠️ Confirmer la suppression'
            ) : (
              '🗑️ Supprimer ce progrès'
            )}
          </Button>
        )}
        </form>
      </div>
    </BottomSheetModal>
  );
}

