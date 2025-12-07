'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type User = {
  id: number;
  name: string;
};

type UserContextType = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'synapso_current_user';
const DEFAULT_USER_NAME = 'Calypso';

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les utilisateurs depuis l'API
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then((data: User[]) => {
        if (Array.isArray(data)) {
          setUsers(data);
          
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
                setCurrentUserState(defaultUser);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser));
              }
            } catch (error) {
              console.error('Erreur lors du chargement de l\'utilisateur:', error);
              const defaultUser = data.find(u => u.name === DEFAULT_USER_NAME) || data[0];
              setCurrentUserState(defaultUser);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser));
            }
          } else {
            // Par défaut, utiliser Calypso
            const defaultUser = data.find(u => u.name === DEFAULT_USER_NAME) || data[0];
            setCurrentUserState(defaultUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser));
          }
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        setLoading(false);
      });
  }, []);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, users, loading }}>
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

