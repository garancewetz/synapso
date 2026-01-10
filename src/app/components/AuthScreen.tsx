'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Button } from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Loader from '@/app/components/ui/Loader';
import Logo from '@/app/components/ui/Logo';

type Props = {
  onSuccess: () => void;
};

type AuthMode = 'login' | 'register';

export function AuthScreen({ onSuccess }: Props) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation basique
    if (!name.trim()) {
      setError('Le nom est obligatoire');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Le mot de passe est obligatoire');
      setLoading(false);
      return;
    }

    // En mode register, validations supplémentaires
    if (mode === 'register') {
      if (password.length < 4) {
        setError('Le mot de passe doit contenir au moins 4 caractères');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          name: name.trim(), 
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setName('');
        setPassword('');
        setConfirmPassword('');
        onSuccess();
      } else {
        setError(data.error || 'Une erreur est survenue');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-amber-50 via-white to-orange-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={80} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Synapso</h1>
          <p className="text-gray-600">Votre compagnon de rééducation</p>
        </div>

        {/* Card de connexion/inscription */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={clsx(
                'flex-1 py-4 text-sm font-medium transition-colors cursor-pointer',
                mode === 'login'
                  ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={clsx(
                'flex-1 py-4 text-sm font-medium transition-colors cursor-pointer',
                mode === 'register'
                  ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              Créer un compte
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Message d'erreur */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Nom */}
            <Input
              label="Nom"
              type="text"
              placeholder="Votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoFocus
              autoComplete="username"
            />

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Minimum 4 caractères' : 'Votre mot de passe'}
                  disabled={loading}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all disabled:bg-gray-50 disabled:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirmation mot de passe (inscription uniquement) */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez votre mot de passe"
                  disabled={loading}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            )}

            {/* Bouton de soumission */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size="small" />
                  <span>{mode === 'login' ? 'Connexion...' : 'Création...'}</span>
                </span>
              ) : (
                mode === 'login' ? 'Se connecter' : 'Créer mon compte'
              )}
            </Button>

            {/* Lien pour changer de mode */}
            <p className="text-center text-sm text-gray-600">
              {mode === 'login' ? (
                <>
                  Pas encore de compte ?{' '}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="text-amber-600 hover:text-amber-700 font-medium cursor-pointer"
                  >
                    Créer un compte
                  </button>
                </>
              ) : (
                <>
                  Déjà un compte ?{' '}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="text-amber-600 hover:text-amber-700 font-medium cursor-pointer"
                  >
                    Se connecter
                  </button>
                </>
              )}
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Application de rééducation post-AVC
        </p>
      </div>
    </div>
  );
}
