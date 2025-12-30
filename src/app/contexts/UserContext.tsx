'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type User = {
  id: number;
  name: string;
  resetFrequency?: 'DAILY' | 'WEEKLY';
  dominantHand?: 'LEFT' | 'RIGHT';
};

type UserContextType = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  /** Met à jour l'utilisateur courant ET la liste des utilisateurs (optimistic update) */
  updateCurrentUser: (updatedUser: User) => void;
  users: User[];
  loading: boolean;
  changingUser: boolean;
  refreshUsers: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'synapso_current_user';
const DEFAULT_USER_NAME = 'Calypso';

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingUser, setChangingUser] = useState(false);

  // Fonction pour traiter les données utilisateurs (extrait pour éviter la duplication)
  const processUsersData = useCallback((data: User[], skipCurrentUserUpdate = false) => {
    if (Array.isArray(data)) {
      setUsers(data);
      
      // Si on ne doit pas mettre à jour currentUser (ex: après un updateCurrentUser)
      if (skipCurrentUserUpdate) return;
      
      // Charger l'utilisateur depuis localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const storedUser = JSON.parse(stored);
          // Vérifier que l'utilisateur stocké existe toujours dans la liste
          const foundUser = data.find(u => u.id === storedUser.id);
          if (foundUser) {
            setCurrentUserState(foundUser);
          } else {
            // Si l'utilisateur stocké n'existe plus, utiliser le défaut
            const defaultUser = data.find(u => u.name === DEFAULT_USER_NAME) || data[0];
            if (defaultUser) {
              setCurrentUserState(defaultUser);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser));
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement de l\'utilisateur:', error);
          const defaultUser = data.find(u => u.name === DEFAULT_USER_NAME) || data[0];
          if (defaultUser) {
            setCurrentUserState(defaultUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser));
          }
        }
      } else {
        // Par défaut, utiliser Calypso ou le premier utilisateur
        const defaultUser = data.find(u => u.name === DEFAULT_USER_NAME) || data[0];
        if (defaultUser) {
          setCurrentUserState(defaultUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser));
        }
      }
    }
  }, []);

  // Fonction pour charger les utilisateurs
  const loadUsers = useCallback(async (skipCurrentUserUpdate = false) => {
    try {
      const res = await fetch('/api/users', { credentials: 'include' });
      
      if (!res.ok) {
        if (res.status === 401) {
          console.error('Authentification requise pour charger les utilisateurs');
          setUsers([]);
          setCurrentUserState(null);
          setLoading(false);
          return;
        }
        throw new Error(`Erreur HTTP: ${res.status}`);
      }

      const data: User[] = await res.json();
      processUsersData(data, skipCurrentUserUpdate);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setUsers([]);
      setLoading(false);
    }
  }, [processUsersData]);

  // Charger les utilisateurs au montage
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Fonction pour recharger les utilisateurs
  const refreshUsers = async () => {
    await loadUsers();
  };

  // Changer l'utilisateur courant (pour switcher entre utilisateurs)
  const setCurrentUser = (user: User | null) => {
    setChangingUser(true);
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setTimeout(() => {
      setChangingUser(false);
    }, 500);
  };

  // Mettre à jour l'utilisateur courant (après modification de ses settings)
  // Optimistic update : met à jour immédiatement le state local et la liste
  const updateCurrentUser = useCallback((updatedUser: User) => {
    // 1. Mettre à jour currentUser immédiatement
    setCurrentUserState(updatedUser);
    
    // 2. Mettre à jour le localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    
    // 3. Mettre à jour la liste des utilisateurs (optimistic update)
    setUsers(prevUsers => 
      prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
    );
  }, []);

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      setCurrentUser, 
      updateCurrentUser,
      users, 
      loading, 
      changingUser, 
      refreshUsers 
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
