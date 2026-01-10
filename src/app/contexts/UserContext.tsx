'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  // Admin only
  /** Liste de tous les utilisateurs (admin only) */
  allUsers: UserWithStats[];
  /** Impersonner un utilisateur (admin only) */
  impersonate: (userId: number) => Promise<void>;
  /** Arrêter l'impersonation (admin only) */
  stopImpersonation: () => Promise<void>;
  /** Recharger la liste des utilisateurs (admin only) */
  refreshAllUsers: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<UserWithStats[]>([]);

  // L'utilisateur effectif est l'impersonné si présent, sinon le connecté
  const effectiveUser = impersonatedUser || currentUser;

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
  const refreshUser = async () => {
    await loadUser();
  };

  // Recharger la liste des utilisateurs (admin only)
  const refreshAllUsers = async () => {
    await loadAllUsers();
  };

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
  const logout = async () => {
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
  };

  // Impersonner un utilisateur (admin only)
  const impersonate = async (userId: number) => {
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
  };

  // Arrêter l'impersonation (admin only)
  const stopImpersonation = async () => {
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
  };

  return (
    <UserContext.Provider value={{ 
      currentUser,
      effectiveUser,
      isAdmin,
      loading,
      updateEffectiveUser,
      logout,
      refreshUser,
      allUsers,
      impersonate,
      stopImpersonation,
      refreshAllUsers,
    }}>
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
