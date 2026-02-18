import { useState, useEffect, useCallback, useRef } from 'react';

type UseFormDataOptions<T> = {
  entityId?: number;
  fetchUrl: string;
  transform?: (data: unknown) => T;
  enabled?: boolean;
};

type UseFormDataReturn<T> = {
  formData: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

/**
 * Hook générique pour charger les données d'un formulaire
 * Gère le fetch initial, le loading, et les erreurs
 */
export function useFormData<T>({
  entityId,
  fetchUrl,
  transform,
  enabled = true,
}: UseFormDataOptions<T>): UseFormDataReturn<T> {
  const [formData, setFormData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!entityId);
  const [error, setError] = useState<string | null>(null);

  // Ref stable pour transform afin d'éviter les boucles infinies
  // quand l'appelant passe une fonction inline
  const transformRef = useRef(transform);
  transformRef.current = transform;

  const fetchData = useCallback(async () => {
    if (!entityId || !enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(fetchUrl, { credentials: 'include' });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      const transformedData = transformRef.current ? transformRef.current(data) : (data as T);
      setFormData(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(errorMessage);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [entityId, fetchUrl, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { formData, loading, error, refetch: fetchData };
}
