import { useState, useCallback } from 'react';

type UseErrorHandlerReturn = {
  error: string;
  setError: (error: string) => void;
  handleError: (err: unknown, defaultMessage: string) => void;
  clearError: () => void;
};

/**
 * Hook générique pour gérer les erreurs dans les formulaires et composants
 * Centralise la logique de gestion d'erreurs
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState('');

  const handleError = useCallback((err: unknown, defaultMessage: string) => {
    const message = err instanceof Error ? err.message : defaultMessage;
    setError(message);
  }, []);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return { error, setError, handleError, clearError };
}
