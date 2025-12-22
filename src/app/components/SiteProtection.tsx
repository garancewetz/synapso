'use client';

import { useState, useEffect } from 'react';
import PasswordModal from '@/app/components/PasswordModal';
import InitialLoader from '@/app/components/InitialLoader';

interface SiteProtectionProps {
  children: React.ReactNode;
}

export default function SiteProtection({ children }: SiteProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier l'authentification côté serveur via l'API
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include', // Important pour envoyer les cookies
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

  const handlePasswordSuccess = () => {
    // Après succès, le cookie est déjà défini par le serveur
    // On vérifie à nouveau l'authentification
    fetch('/api/auth/check', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(data.authenticated);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  };

  if (isLoading) {
    return <InitialLoader />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès protégé</h1>
            <p className="text-gray-600 mb-6">Veuillez entrer le mot de passe pour accéder au site</p>
          </div>
        </div>
        <PasswordModal
          isOpen={true}
          onClose={() => {}}
          onSuccess={handlePasswordSuccess}
          title="Accès au site"
        />
      </>
    );
  }

  return <>{children}</>;
}

