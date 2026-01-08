'use client';

import { useState, useEffect } from 'react';
import { CATEGORY_ORDER, CATEGORY_ICONS, CATEGORY_LABELS_SHORT } from '@/app/constants/exercice.constants';
import { VICTORY_TAGS, VICTORY_CATEGORY_COLORS, VICTORY_TAGS_WITH_EMOJI, ORTHOPHONIE_COLORS } from '@/app/constants/victory.constants';
import { VICTORY_EMOJIS, CATEGORY_EMOJIS, ORTHOPHONIE_VICTORY_EMOJI } from '@/app/constants/emoji.constants';
import { getExerciceCategoryFromEmoji, isOrthophonieVictory } from '@/app/utils/victory.utils';
import { useSpeechRecognition } from '@/app/hooks/useSpeechRecognition';
import { BottomSheetModal, DeleteButton } from '@/app/components/ui';
import ErrorMessage from '@/app/components/ErrorMessage';
import { useUser } from '@/app/contexts/UserContext';
import type { ExerciceCategory } from '@/app/types/exercice';
import type { Victory } from '@/app/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
  victoryToEdit?: Victory | null;
  defaultCategory?: VictoryCategory;
};

type VictoryCategory = ExerciceCategory | 'ORTHOPHONIE';

export default function VictoryBottomSheet({ isOpen, onClose, onSuccess, userId, victoryToEdit, defaultCategory }: Props) {
  const { currentUser } = useUser();
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VictoryCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const isEditMode = !!victoryToEdit;

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

  // Pré-remplir les champs en mode édition ou avec defaultCategory
  useEffect(() => {
    if (isOpen && victoryToEdit) {
      setContent(victoryToEdit.content);
      // Utiliser les utilitaires factorisés pour déterminer la catégorie
      if (isOrthophonieVictory(victoryToEdit.emoji)) {
        setSelectedCategory('ORTHOPHONIE');
      } else {
        const categoryFromEmoji = getExerciceCategoryFromEmoji(victoryToEdit.emoji);
        setSelectedCategory(categoryFromEmoji || null);
      }
    } else if (isOpen && defaultCategory) {
      // Pré-sélectionner la catégorie par défaut si fournie
      setSelectedCategory(defaultCategory);
    } else if (!isOpen) {
      setContent('');
      setSelectedCategory(null);
    }
  }, [isOpen, victoryToEdit, defaultCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Clique sur un tag ou écris quelque chose !');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Déterminer l'emoji selon la catégorie sélectionnée
    const categoryEmoji = selectedCategory === 'ORTHOPHONIE' 
      ? ORTHOPHONIE_VICTORY_EMOJI 
      : selectedCategory 
        ? CATEGORY_ICONS[selectedCategory] 
        : null;

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

  const handleDelete = async () => {
    if (!victoryToEdit) return;

    try {
      const response = await fetch(`/api/victories/${victoryToEdit.id}`, {
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
    setSelectedCategory(null);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTagClick = (label: string, emoji: string) => {
    // Pour Force, Souplesse, Équilibre : format "emoji+label+emoji"
    // Pour Confort : juste le label sans emoji
    const shouldUseEmojiFormat = VICTORY_TAGS_WITH_EMOJI.includes(label as typeof VICTORY_TAGS_WITH_EMOJI[number]);
    
    const textToAdd = shouldUseEmojiFormat ? `${emoji}${label}${emoji}` : label;
    const isActive = content.includes(textToAdd);
    
    if (isActive) {
      setContent(prev => prev.replace(textToAdd, '').replace(/\s+/g, ' ').trim());
    } else {
      setContent(prev => prev ? `${prev} ${textToAdd}` : textToAdd);
    }
  };

  return (
    <BottomSheetModal isOpen={isOpen} onClose={handleClose}>
      {/* Titre */}
        <div className="text-center pb-3 md:pt-4">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Modifier ta victoire ✏️' : `Ta victoire ! ${VICTORY_EMOJIS.STAR_BRIGHT}`}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-8">
        {/* Tags de victoire */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {VICTORY_TAGS.map(({ label, emoji }) => {
            // Pour Force, Souplesse, Équilibre : vérifier avec format emoji+label+emoji
            // Pour Confort : vérifier juste le label
            const shouldUseEmojiFormat = VICTORY_TAGS_WITH_EMOJI.includes(label as typeof VICTORY_TAGS_WITH_EMOJI[number]);
            const textToCheck = shouldUseEmojiFormat ? `${emoji}${label}${emoji}` : label;
            const isActive = content.includes(textToCheck);
            
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleTagClick(label, emoji)}
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
              value={displayContent}
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

        {/* Catégories */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 text-center mb-2">Zone travaillée (optionnel)</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {/* Catégories physiques */}
            {CATEGORY_ORDER.map((category) => {
              const emoji = CATEGORY_ICONS[category];
              const label = CATEGORY_LABELS_SHORT[category];
              const colors = VICTORY_CATEGORY_COLORS[category];
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
            
            {/* Option Orthophonie - à la fin avec couleur jaune (uniquement si l'utilisateur est aphasique) */}
            {currentUser?.isAphasic && (
              <button
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === 'ORTHOPHONIE' ? null : 'ORTHOPHONIE')}
                className="flex flex-col items-center gap-1 transition-all duration-150"
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  transition-all duration-150
                  ${selectedCategory === 'ORTHOPHONIE' 
                    ? `${ORTHOPHONIE_COLORS.active} scale-110` 
                    : `${ORTHOPHONIE_COLORS.inactive} hover:scale-105`
                  }
                `}>
                  <span className="text-xl">{CATEGORY_EMOJIS.ORTHOPHONIE}</span>
                </div>
                <span className={`text-[10px] font-medium ${selectedCategory === 'ORTHOPHONIE' ? 'text-gray-900' : 'text-gray-500'}`}>
                  Ortho
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
            className="flex-1 py-4 px-4 rounded-2xl font-semibold text-gray-600 
                       bg-gray-100 hover:bg-gray-200
                       transition-all active:scale-[0.98] cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="flex-1 py-4 px-4 rounded-2xl font-bold text-amber-950 
                       bg-linear-to-r from-amber-300 via-yellow-400 to-amber-500 
                       shadow-md hover:shadow-lg
                       transition-all active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2 cursor-pointer"
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

        {/* Bouton supprimer (mode édition uniquement) */}
        {isEditMode && (
          <DeleteButton
            onDelete={handleDelete}
            label="🗑️ Supprimer cette victoire"
            disabled={isSubmitting}
            className="mt-3"
          />
        )}
        </form>
    </BottomSheetModal>
  );
}
