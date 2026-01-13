'use client';

import { useState, useEffect, useRef } from 'react';
import { AuthScreen } from '@/app/components/AuthScreen';
import { InitialLoader } from '@/app/components/InitialLoader';
import { useUser } from '@/app/contexts/UserContext';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  onAuthSuccess?: () => void;
};

export function SiteProtection({ children, onAuthSuccess }: Props) {
  const { currentUser, loading: userLoading, refreshUser } = useUser();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ref pour tracker la valeur précédente de currentUser
  // Permet de détecter une vraie déconnexion (passage de non-null à null)
  const prevCurrentUserRef = useRef<typeof currentUser | undefined>(undefined);

  // Vérification initiale de l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.authenticated);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Synchroniser avec UserContext : si currentUser passe de non-null à null → déconnexion
  useEffect(() => {
    // Ne pas agir pendant le chargement initial
    if (userLoading || isLoading) return;
    
    const prevUser = prevCurrentUserRef.current;
    prevCurrentUserRef.current = currentUser;
    
    // Seulement si on avait un utilisateur et qu'il devient null → vraie déconnexion
    // Ignorer le cas où prevUser est undefined (premier render) ou null (pas encore connecté)
    if (prevUser !== undefined && prevUser !== null && currentUser === null) {
      setIsAuthenticated(false);
    }
  }, [currentUser, userLoading, isLoading]);

  const handleAuthSuccess = async () => {
    try {
      // Rafraîchir le contexte utilisateur pour synchroniser currentUser
      await refreshUser();
      
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          onAuthSuccess?.();
        } else {
          console.error('Authentification échouée après connexion');
          setIsAuthenticated(false);
        }
      } else {
        console.error('Erreur lors de la vérification de l\'authentification');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      setIsAuthenticated(false);
    }
  };

  if (isLoading) {
    return <InitialLoader />;
  }

  if (!isAuthenticated) {
    return <AuthScreen onSuccess={handleAuthSuccess} />;
  }

  return <>{children}</>;
}
