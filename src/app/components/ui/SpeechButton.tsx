'use client';

import clsx from 'clsx';

type Props = {
  isListening: boolean;
  onClick: () => void;
  /** Position du bouton : 'input' pour input (centré verticalement), 'textarea' pour textarea (en haut) */
  position?: 'input' | 'textarea';
};

/**
 * Bouton de dictée vocale réutilisable
 * Affiche un micro 🎤 ou un bouton stop ⏹️ selon l'état d'écoute
 */
export function SpeechButton({ 
  isListening, 
  onClick,
  position = 'input'
}: Props) {
  const positionClasses = position === 'input'
    ? 'right-2 top-1/2 -translate-y-1/2'
    : 'right-2 top-2';

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'absolute w-9 h-9 rounded-full',
        'flex items-center justify-center transition-all cursor-pointer',
        positionClasses,
        isListening 
          ? 'bg-red-500 text-white animate-pulse shadow-lg' 
          : 'bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-700'
      )}
      aria-label={isListening ? 'Arrêter la dictée' : 'Dicter'}
    >
      <span className="text-base">{isListening ? '⏹️' : '🎤'}</span>
    </button>
  );
}

