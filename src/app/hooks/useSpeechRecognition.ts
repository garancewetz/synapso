import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  lang?: string;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  /** Texte en cours de reconnaissance (temps réel) */
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
}

/**
 * Détecte la locale du navigateur pour la reconnaissance vocale
 * Retourne 'fr-FR' par défaut si non détectée
 */
function getBrowserLocale(): string {
  if (typeof window === 'undefined') {
    return 'fr-FR';
  }
  
  // Utiliser navigator.languages (première préférence) ou navigator.language
  const browserLang = navigator.languages?.[0] || navigator.language || 'fr-FR';
  
  // Si la locale est déjà au format complet (ex: 'fr-FR'), la retourner telle quelle
  if (browserLang.includes('-')) {
    return browserLang;
  }
  
  // Sinon, essayer de trouver une correspondance (ex: 'fr' -> 'fr-FR')
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  // Pour le français, retourner 'fr-FR'
  if (langCode === 'fr') {
    return 'fr-FR';
  }
  
  // Pour d'autres langues, retourner la locale du navigateur avec une variante par défaut
  // (ex: 'en' -> 'en-US', 'es' -> 'es-ES')
  return `${langCode}-${langCode.toUpperCase()}`;
}

/**
 * Hook pour la reconnaissance vocale (dictée)
 * Affiche le texte en temps réel pendant la parole
 * Détecte automatiquement la locale de l'appareil pour la reconnaissance vocale
 */
export function useSpeechRecognition({
  onResult,
  onError,
  lang,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  // Utiliser la langue fournie, sinon détecter automatiquement la locale du navigateur
  const detectedLang = lang || getBrowserLocale();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Vérifier le support au montage
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript('');
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = detectedLang;
    recognition.continuous = true;      // Continuer d'écouter
    recognition.interimResults = true;  // Résultats en temps réel

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript('');
    };
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      // Parcourir tous les résultats
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          // Résultat final - envoyer au callback
          final += transcript;
        } else {
          // Résultat intermédiaire - afficher en temps réel
          interim += transcript;
        }
      }

      // Mettre à jour le texte intermédiaire
      setInterimTranscript(interim);

      // Envoyer les résultats finaux
      if (final && onResult) {
        onResult(final);
      }
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setInterimTranscript('');
      if (event.error === 'not-allowed') {
        onError?.('Autorise le micro pour utiliser la dictée vocale');
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [detectedLang, onResult, onError]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening,
  };
}
