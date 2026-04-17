import { subDays } from 'date-fns';
import type { Exercice } from '@/app/types';
import type { HistoryEntry } from '@/app/types';
import type { JournalNote } from '@/app/types';
import type { Progress } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';
import { queryKeys } from './query-keys';

export { queryKeys };

export async function fetchExercices(filters: {
  category?: ExerciceCategory;
  equipments?: string[];
  includeArchived?: boolean;
  targetDate?: string;
}): Promise<Exercice[]> {
  const params = new URLSearchParams();
  if (filters.category) {
    params.append('category', filters.category);
  }
  if (filters.equipments && filters.equipments.length > 0) {
    params.append('equipments', filters.equipments.map(eq => encodeURIComponent(eq)).join(','));
  }
  if (filters.includeArchived) {
    params.append('includeArchived', 'true');
  }
  if (filters.targetDate) {
    params.append('targetDate', filters.targetDate);
  }
  
  const url = params.toString()
    ? `/api/exercices?${params.toString()}`
    : `/api/exercices`;

  const res = await fetch(url, { credentials: 'include' });
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || `Erreur HTTP: ${res.status}`);
  }
  
  const exercices = await res.json();
  return exercices;
}

/**
 * @param since - Borne temporelle "après ce moment" (ISO), pas une journée ; utilisé pour limiter la plage d'historique.
 */
export async function fetchHistory(params: { since?: string; days?: number; referenceDate?: string }): Promise<HistoryEntry[]> {
  const isDateKey = params.referenceDate && /^\d{4}-\d{2}-\d{2}$/.test(params.referenceDate);
  const baseDate = params.referenceDate
    ? (isDateKey ? new Date(params.referenceDate + 'T12:00:00.000Z') : new Date(params.referenceDate))
    : new Date();

  const url = params.days !== null && params.days !== undefined
    ? `/api/history?since=${encodeURIComponent(subDays(baseDate, params.days).toISOString())}`
    : '/api/history';

  const res = await fetch(url, { credentials: 'include' });
  
  if (!res.ok) {
    throw new Error(`Erreur HTTP: ${res.status}`);
  }
  
  return res.json();
}

export async function fetchProgress(params: { limit?: number; offset?: number }): Promise<Progress[]> {
  const searchParams = new URLSearchParams();
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
  if (params.offset !== undefined && params.offset > 0) searchParams.set('offset', String(params.offset));
  const query = searchParams.toString();
  const url = query ? `/api/progress?${query}` : '/api/progress';

  const res = await fetch(url, { credentials: 'include' });

  if (!res.ok) {
    if (res.status === 404) {
      return [];
    }
    throw new Error(`Erreur HTTP: ${res.status}`);
  }

  return res.json();
}

export async function fetchJournalNotes(): Promise<JournalNote[]> {
  const res = await fetch('/api/journal/notes', { credentials: 'include' });
  if (!res.ok) {
    throw new Error(`Erreur HTTP: ${res.status}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('Erreur lors du chargement des notes');
  }
  return data.sort(
    (a: JournalNote, b: JournalNote) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

type User = {
  id: number;
  name: string;
  role: 'USER' | 'ADMIN';
  resetFrequency?: 'DAILY' | 'WEEKLY';
  dominantHand?: 'LEFT' | 'RIGHT';
  hasJournal?: boolean;
  createdAt?: string;
};

export type FetchUserResponse = {
  authenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  impersonatedUser: User | null;
};

export async function fetchUser(): Promise<FetchUserResponse> {
  const res = await fetch('/api/auth/check', { credentials: 'include' });
  
  if (!res.ok) {
    // Si l'API retourne une erreur, retourner une réponse par défaut (non authentifié)
    // plutôt que de lancer une erreur, pour permettre à l'app de continuer
    return {
      authenticated: false,
      user: null,
      isAdmin: false,
      impersonatedUser: null,
    };
  }
  
  return res.json();
}

// ⚡ SHARES: Fetch functions pour le partage d'exercices

export type ShareableUser = { id: number; name: string };

export async function fetchShareableUsers(): Promise<ShareableUser[]> {
  const res = await fetch('/api/shares/users', { credentials: 'include' });
  if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
  return res.json();
}

export type ReceivedShare = {
  id: number;
  createdAt: string;
  sender: { id: number; name: string };
  exercice: {
    id: number;
    name: string;
    description: string;
    category: string;
    workout: { repeat: string | null; series: string | null; duration: string | null };
    equipments: string[];
    media?: { photos?: { url: string; publicId: string }[]; video?: { url: string; publicId: string } | null } | null;
  } | null;
};

export async function fetchReceivedShares(): Promise<ReceivedShare[]> {
  const res = await fetch('/api/shares', { credentials: 'include' });
  if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
  return res.json();
}

export async function fetchPendingShareCount(): Promise<number> {
  const res = await fetch('/api/shares/count', { credentials: 'include' });
  if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
  const data = await res.json();
  return data.count;
}
