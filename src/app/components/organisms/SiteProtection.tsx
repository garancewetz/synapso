'use client';

import { useState, useEffect } from 'react';
import PasswordModal from '@/app/components/atoms/PasswordModal';

interface SiteProtectionProps {
  children: React.ReactNode;
}

export default function SiteProtection({ children }: SiteProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà authentifié (sessionStorage)
    const authStatus = sessionStorage.getItem('site_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handlePasswordSuccess = () => {
    sessionStorage.setItem('site_authenticated', 'true');
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
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

