'use client';

import { useState, useEffect } from 'react';
import { AuthScreen } from '@/app/components/AuthScreen';
import InitialLoader from '@/app/components/InitialLoader';
import { useUser } from '@/app/contexts/UserContext';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  onAuthSuccess?: () => void;
};

export default function SiteProtection({ children, onAuthSuccess }: Props) {
  const { currentUser, loading: userLoading } = useUser();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  // Synchroniser avec UserContext : si currentUser devient null (déconnexion), réinitialiser l'état
  useEffect(() => {
    // Ne pas agir pendant le chargement initial
    if (userLoading || isLoading) return;
    
    // Si l'utilisateur était authentifié mais currentUser est maintenant null → déconnexion
    if (isAuthenticated && currentUser === null) {
      setIsAuthenticated(false);
    }
  }, [currentUser, userLoading, isLoading, isAuthenticated]);

  const handleAuthSuccess = async () => {
    try {
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
