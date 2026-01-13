'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Loader } from '@/app/components/ui/Loader';
import { Logo } from '@/app/components/ui/Logo';
import { UserSetup } from '@/app/components/UserSetup';

type Props = {
  onSuccess: () => void;
};

type AuthMode = 'login' | 'register';

export function AuthScreen({ onSuccess }: Props) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUserSetup, setShowUserSetup] = useState(false);
  const [newUserId, setNewUserId] = useState<number | null>(null);

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
      if (!invitationCode.trim()) {
        setError('Le code d\'invitation est obligatoire');
        setLoading(false);
        return;
      }

      if (password.length < 8) {
        setError('Le mot de passe doit contenir au moins 8 caractères');
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
          ...(mode === 'register' && { invitationCode: invitationCode.trim() }),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setName('');
        setPassword('');
        setConfirmPassword('');
        setInvitationCode('');
        
        // Si c'est une création de compte, afficher UserSetup
        if (mode === 'register') {
          setNewUserId(data.user.id);
          setShowUserSetup(true);
        } else {
          onSuccess();
        }
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
    setInvitationCode('');
  };

  // Si UserSetup est affiché, ne pas afficher le formulaire d'auth
  if (showUserSetup) {
    return null; // UserSetup gère son propre affichage plein écran
  }

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
            <Button
              type="button"
              onClick={() => setMode('login')}
              variant="secondary"
              className={clsx(
                'flex-1 py-4 text-sm font-medium rounded-none border-0 border-b-2 transition-colors',
                mode === 'login'
                  ? 'text-amber-600 border-amber-500 bg-amber-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-transparent'
              )}
            >
              Se connecter
            </Button>
            <Button
              type="button"
              onClick={() => setMode('register')}
              variant="secondary"
              className={clsx(
                'flex-1 py-4 text-sm font-medium rounded-none border-0 border-b-2 transition-colors',
                mode === 'register'
                  ? 'text-amber-600 border-amber-500 bg-amber-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-transparent'
              )}
            >
              Créer un compte
            </Button>
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
              autoComplete="name"
            />

            {/* Code d'invitation (inscription uniquement) */}
            {mode === 'register' && (
              <div>
                <label htmlFor="invitationCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Code d&apos;invitation
                </label>
                <input
                  id="invitationCode"
                  type="text"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  placeholder="Entrez le code d'invitation"
                  disabled={loading}
                  required
                  aria-required="true"
                  aria-describedby="invitationCode-help"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all disabled:bg-gray-50 disabled:text-gray-400"
                />
                <p id="invitationCode-help" className="mt-1 text-sm text-gray-500">
                  Ce code vous a été fourni par votre administrateur
                </p>
              </div>
            )}

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
                  placeholder={mode === 'register' ? 'Minimum 8 caractères' : 'Votre mot de passe'}
                  disabled={loading}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all disabled:bg-gray-50 disabled:text-gray-400"
                />
                <Button
                  type="button"
                  iconOnly
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 !border-0 !bg-transparent !shadow-none text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </Button>
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
              variant="action"
              size="lg"
              rounded="lg"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600"
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
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={switchMode}
                    className="!p-0 !bg-transparent !border-0 !shadow-none text-amber-600 hover:text-amber-700 font-medium inline"
                  >
                    Créer un compte
                  </Button>
                </>
              ) : (
                <>
                  Déjà un compte ?{' '}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={switchMode}
                    className="!p-0 !bg-transparent !border-0 !shadow-none text-amber-600 hover:text-amber-700 font-medium inline"
                  >
                    Se connecter
                  </Button>
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

      {/* UserSetup pour nouveaux utilisateurs */}
      {showUserSetup && newUserId && (
        <UserSetup
          userId={newUserId}
          onComplete={() => {
            setShowUserSetup(false);
            onSuccess();
          }}
          onSkip={() => {
            setShowUserSetup(false);
            onSuccess();
          }}
        />
      )}
    </div>
  );
}
