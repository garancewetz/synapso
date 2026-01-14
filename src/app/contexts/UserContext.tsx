'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: number;
  name: string;
  role: 'USER' | 'ADMIN';
  resetFrequency?: 'DAILY' | 'WEEKLY';
  dominantHand?: 'LEFT' | 'RIGHT';
  isAphasic?: boolean;
  createdAt?: string;
};

type UserWithStats = User & {
  _count?: {
    exercices: number;
    progress: number;
    aphasieItems: number;
    aphasieChallenges: number;
  };
};

type UserContextType = {
  /** L'utilisateur connecté (toujours l'admin s'il est connecté) */
  currentUser: User | null;
  /** L'utilisateur effectif (impersonné si admin, sinon currentUser) */
  effectiveUser: User | null;
  /** Si l'utilisateur connecté est admin */
  isAdmin: boolean;
  /** Chargement en cours */
  loading: boolean;
  /** Met à jour l'utilisateur effectif (après modification de ses settings) */
  updateEffectiveUser: (updatedUser: User) => void;
  /** Déconnexion */
  logout: () => Promise<void>;
  /** Recharger les infos utilisateur */
  refreshUser: () => Promise<void>;
  /** Supprimer un compte utilisateur */
  deleteAccount: (userId: number) => Promise<void>;
  // Admin only
  /** Liste de tous les utilisateurs (admin only) */
  allUsers: UserWithStats[];
  /** Impersonner un utilisateur (admin only) */
  impersonate: (userId: number) => Promise<void>;
  /** Arrêter l'impersonation (admin only) */
  stopImpersonation: () => Promise<void>;
  /** Recharger la liste des utilisateurs (admin only) */
  refreshAllUsers: () => Promise<void>;
  /** Supprimer un compte utilisateur (admin only) */
  deleteUser: (userId: number) => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<UserWithStats[]>([]);

  // ⚡ PERFORMANCE: Mémoriser effectiveUser pour éviter les recalculs inutiles
  // L'utilisateur effectif est l'impersonné si présent, sinon le connecté
  const effectiveUser = useMemo(() => impersonatedUser || currentUser, [impersonatedUser, currentUser]);

  // Charger les infos de l'utilisateur connecté
  const loadUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/check', { credentials: 'include' });
      
      if (!res.ok) {
        setCurrentUser(null);
        setImpersonatedUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const data = await res.json();
      
      if (data.authenticated && data.user) {
        setCurrentUser(data.user);
        setIsAdmin(data.isAdmin);
        setImpersonatedUser(data.impersonatedUser || null);
      } else {
        setCurrentUser(null);
        setImpersonatedUser(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
      setCurrentUser(null);
      setImpersonatedUser(null);
      setIsAdmin(false);
      setLoading(false);
    }
  }, []);

  // Charger la liste de tous les utilisateurs (admin only)
  const loadAllUsers = useCallback(async () => {
    if (!isAdmin) {
      setAllUsers([]);
      return;
    }

    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      } else {
        setAllUsers([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setAllUsers([]);
    }
  }, [isAdmin]);

  // Charger l'utilisateur au montage
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Charger la liste des utilisateurs quand on devient admin
  useEffect(() => {
    if (isAdmin) {
      loadAllUsers();
    }
  }, [isAdmin, loadAllUsers]);

  // Recharger les infos utilisateur
  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  // Recharger la liste des utilisateurs (admin only)
  const refreshAllUsers = useCallback(async () => {
    await loadAllUsers();
  }, [loadAllUsers]);

  // Mettre à jour l'utilisateur effectif (après modification de ses settings)
  const updateEffectiveUser = useCallback((updatedUser: User) => {
    if (impersonatedUser && impersonatedUser.id === updatedUser.id) {
      // On modifie l'utilisateur impersonné
      setImpersonatedUser(updatedUser);
    } else if (currentUser && currentUser.id === updatedUser.id) {
      // On modifie notre propre compte
      setCurrentUser(updatedUser);
    }
    
    // Mettre à jour dans la liste allUsers si admin
    if (isAdmin) {
      setAllUsers(prevUsers => 
        prevUsers.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u)
      );
    }
  }, [currentUser, impersonatedUser, isAdmin]);

  // Déconnexion
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include',
      });
      
      setCurrentUser(null);
      setImpersonatedUser(null);
      setIsAdmin(false);
      setAllUsers([]);
      
      // Recharger la page pour afficher l'écran de connexion
      router.refresh();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }, [router]);

  // Impersonner un utilisateur (admin only)
  const impersonate = useCallback(async (userId: number) => {
    if (!isAdmin) return;

    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        const data = await res.json();
        setImpersonatedUser(data.impersonatedUser);
      }
    } catch (error) {
      console.error('Erreur lors de l\'impersonation:', error);
    }
  }, [isAdmin]);

  // Arrêter l'impersonation (admin only)
  const stopImpersonation = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setImpersonatedUser(null);
      }
    } catch (error) {
      console.error('Erreur lors de l\'arrêt de l\'impersonation:', error);
    }
  }, [isAdmin]);

  // Supprimer un compte utilisateur (pour supprimer son propre compte)
  const deleteAccount = useCallback(async (userId: number) => {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la suppression');
    }

    // Nettoyer le localStorage
    localStorage.removeItem('synapso_current_user');
    
    // Réinitialiser l'état
    setCurrentUser(null);
    setImpersonatedUser(null);
    setIsAdmin(false);
    setAllUsers([]);
  }, []);

  // Supprimer un compte utilisateur (admin only - pour supprimer n'importe quel compte)
  const deleteUser = useCallback(async (userId: number) => {
    if (!isAdmin) {
      throw new Error('Accès refusé. Droits administrateur requis.');
    }

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur lors de la suppression');
      }

      // Si on supprimait l'utilisateur impersonné, arrêter l'impersonation
      if (impersonatedUser && impersonatedUser.id === userId) {
        await stopImpersonation();
      }

      // Recharger la liste des utilisateurs
      await refreshAllUsers();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error; // Propager l'erreur pour affichage dans le composant
    }
  }, [isAdmin, impersonatedUser, stopImpersonation, refreshAllUsers]);

  // ⚡ PERFORMANCE: Mémoriser la valeur du context pour éviter les re-renders inutiles
  // Quand une valeur change, seuls les composants qui utilisent cette valeur se re-renderont
  const contextValue = useMemo<UserContextType>(() => ({
    currentUser,
    effectiveUser,
    isAdmin,
    loading,
    updateEffectiveUser,
    logout,
    refreshUser,
    deleteAccount,
    allUsers,
    impersonate,
    stopImpersonation,
    refreshAllUsers,
    deleteUser,
  }), [
    currentUser,
    effectiveUser,
    isAdmin,
    loading,
    updateEffectiveUser,
    logout,
    refreshUser,
    deleteAccount,
    allUsers,
    impersonate,
    stopImpersonation,
    refreshAllUsers,
    deleteUser,
  ]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
