import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/app/contexts/UserContext';
import { queryKeys, fetchJournalNotes } from '@/app/lib/api-queries';

export function useJournalNotes() {
  const { effectiveUser, loading: userLoading } = useUser();
  const {
    data: notes = [],
    isLoading: queryLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.journalNotes.list(),
    queryFn: fetchJournalNotes,
    enabled: !userLoading && !!effectiveUser?.id,
  });

  return {
    notes,
    loading: userLoading || queryLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
