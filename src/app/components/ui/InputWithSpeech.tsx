'use client';

import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import { useSpeechRecognition } from '@/app/hooks/useSpeechRecognition';
import { SpeechButton } from './SpeechButton';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  label?: string;
  required?: boolean;
  value: string;
  onValueChange: (value: string) => void;
  onSpeechError?: (error: string) => void;
};

/**
 * Input avec bouton de dictée vocale intégré
 * Affiche le texte en temps réel pendant la parole
 */
export function InputWithSpeech({ 
  label, 
  required, 
  className = '', 
  value,
  onValueChange,
  onSpeechError,
  ...props 
}: Props) {
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

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && '*'}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          type="text"
          required={required}
          value={displayValue}
          onChange={(e) => onValueChange(e.target.value)}
          className={clsx(
            'w-full px-3 py-2 pr-12 border border-gray-300 rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'text-gray-800 placeholder:text-gray-400 transition-all',
            isListening ? 'border-red-400 bg-red-50' : '',
            className
          )}
        />
        {isSupported && (
          <SpeechButton
            isListening={isListening}
            onClick={toggleListening}
            position="input"
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
