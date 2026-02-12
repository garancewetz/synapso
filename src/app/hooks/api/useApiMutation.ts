import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { queryKeys } from '@/app/lib/api-queries';

type ApiMutationOptions<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidateQueries?: Array<keyof typeof queryKeys>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
};

/**
 * Hook générique pour les mutations API avec invalidation automatique du cache
 * Simplifie la création de mutations avec gestion du cache TanStack Query
 */
export function useApiMutation<TData, TVariables>({
  mutationFn,
  invalidateQueries = [],
  onSuccess,
  onError,
}: ApiMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalider les queries spécifiées
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });

      // Callback personnalisé
      if (onSuccess) {
        onSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      console.error('Mutation error:', error);
      if (onError) {
        onError(error as Error, variables);
      }
    },
  });
}
