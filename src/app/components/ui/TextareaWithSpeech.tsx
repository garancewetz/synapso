'use client';

import React from 'react';
import { useSpeechRecognition } from '@/app/hooks/useSpeechRecognition';

interface TextareaWithSpeechProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  value: string;
  onValueChange: (value: string) => void;
  onSpeechError?: (error: string) => void;
}

/**
 * Textarea avec bouton de dictée vocale intégré
 * Affiche le texte en temps réel pendant la parole
 */
export default function TextareaWithSpeech({ 
  label, 
  required, 
  className = '', 
  value,
  onValueChange,
  onSpeechError,
  ...props 
}: TextareaWithSpeechProps) {
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
        <textarea
          {...props}
          required={required}
          value={displayValue}
          onChange={(e) => onValueChange(e.target.value)}
          className={`w-full px-4 py-3 pr-12 border-2 rounded-2xl 
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 
                     resize-none text-gray-800 placeholder:text-gray-400 transition-all
                     ${isListening ? 'border-red-400 bg-red-50' : 'border-gray-200'}
                     ${className}`}
        />
        {isSupported && (
          <button
            type="button"
            onClick={toggleListening}
            className={`absolute right-2 top-2 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse shadow-lg' 
                : 'bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-700'
            }`}
            aria-label={isListening ? 'Arrêter la dictée' : 'Dicter'}
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
  );
}
