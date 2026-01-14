'use client';

import { useRef, useEffect } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';
import { useSpeechRecognition } from '@/app/hooks/useSpeechRecognition';
import { SpeechButton } from './SpeechButton';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  required?: boolean;
  value: string;
  onValueChange: (value: string) => void;
  onSpeechError?: (error: string) => void;
};

/**
 * Textarea avec bouton de dictée vocale intégré
 * Affiche le texte en temps réel pendant la parole
 */
export function TextareaWithSpeech({ 
  label, 
  required, 
  className = '', 
  value,
  onValueChange,
  onSpeechError,
  ...props 
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isListening, isSupported, interimTranscript, toggleListening } = useSpeechRecognition({
    onResult: (transcript) => {
      onValueChange(value ? `${value} ${transcript}` : transcript);
    },
    onError: onSpeechError,
  });

  // Valeur affichée = valeur réelle + texte en cours de reconnaissance
  const displayValue = isListening && interimTranscript 
    ? (value ? `${value} ${interimTranscript}` : interimTranscript)
    : value;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Réinitialiser la hauteur pour obtenir la hauteur réelle du contenu
    textarea.style.height = 'auto';
    // Ajuster la hauteur en fonction du scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [displayValue]);

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && '*'}
        </label>
      )}
      <div className="relative">
        <textarea
          {...props}
          ref={textareaRef}
          required={required}
          value={displayValue}
          onChange={(e) => onValueChange(e.target.value)}
          className={clsx(
            'w-full px-3 py-2 pr-12 border border-gray-300 rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'overflow-hidden resize-none text-gray-800 placeholder:text-gray-400 transition-all',
            isListening ? 'border-red-400 bg-red-50' : '',
            className
          )}
        />
        {isSupported && (
          <SpeechButton
            isListening={isListening}
            onClick={toggleListening}
            position="textarea"
          />
        )}
      </div>
      {isListening && (
        <p className="text-xs text-red-500 font-medium mt-1 text-center">
          🔴 Écoute en cours...{interimTranscript && ` "${interimTranscript}"`}
        </p>
      )}
    </div>
  );
}
