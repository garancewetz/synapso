'use client';

import { useState } from 'react';
import { Input, Button, Loader, ErrorMessage } from '@/app/components';
import { useUser } from '@/app/contexts/UserContext';

interface CreateUserCardProps {
  onUserCreated?: () => void;
}

export default function CreateUserCard({ onUserCreated }: CreateUserCardProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setCurrentUser, refreshUsers } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Le nom est obligatoire');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création');
      }

      const newUser = await response.json();
      
      // Recharger la liste des utilisateurs
      await refreshUsers();
      
      // Définir le nouvel utilisateur comme utilisateur actuel
      setCurrentUser(newUser);
      
      // Callback si fourni
      if (onUserCreated) {
        onUserCreated();
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Créer un utilisateur</h2>
          <p className="text-sm text-gray-500">Commencez par créer votre premier utilisateur</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorMessage message={error} />
        
        <Input
          label="Nom de l'utilisateur"
          type="text"
          required
          placeholder="Ex: Calypso"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />

        <Button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader size="small" />
              <span>Création...</span>
            </>
          ) : (
            'Créer l\'utilisateur'
          )}
        </Button>
      </form>
    </div>
  );
}

