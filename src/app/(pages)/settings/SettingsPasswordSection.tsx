'use client';

import { Button } from '@/app/components/ui/Button';
import { Loader } from '@/app/components/ui/Loader';
import { Card } from '@/app/components/ui/Card';

type Props = {
  showChangePassword: boolean;
  setShowChangePassword: (value: boolean) => void;
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showPasswords: boolean;
  setShowPasswords: (value: boolean) => void;
  changingPassword: boolean;
  passwordError: string;
  setPasswordError: (value: string) => void;
  passwordSuccess: boolean;
  onChangePassword: (e: React.FormEvent) => void;
};

export function SettingsPasswordSection({
  showChangePassword,
  setShowChangePassword,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showPasswords,
  setShowPasswords,
  changingPassword,
  passwordError,
  setPasswordError,
  passwordSuccess,
  onChangePassword,
}: Props) {
  const closeForm = () => {
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Sécurité</h2>

      {passwordSuccess && (
        <div className="p-4 mb-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-emerald-700 text-sm font-medium">
            ✓ Mot de passe modifié avec succès
          </p>
        </div>
      )}

      {!showChangePassword ? (
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowChangePassword(true)}
          disabled={changingPassword}
          className="w-full sm:w-auto"
        >
          <span>🔒</span>
          <span>Changer mon mot de passe</span>
        </Button>
      ) : (
        <Card variant="default" padding="md">
          <form onSubmit={onChangePassword} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">Changer mon mot de passe</h3>
              <button
                type="button"
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{passwordError}</p>
              </div>
            )}

            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe actuel"
                  disabled={changingPassword}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all disabled:bg-gray-50 disabled:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label={showPasswords ? 'Masquer les mots de passe' : 'Afficher les mots de passe'}
                >
                  {showPasswords ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <input
                id="newPassword"
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                disabled={changingPassword}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all disabled:bg-gray-50 disabled:text-gray-400"
              />
              <p className="mt-1 text-xs text-gray-500">Le mot de passe doit contenir au moins 8 caractères</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <input
                id="confirmPassword"
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre nouveau mot de passe"
                disabled={changingPassword}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={changingPassword}
                className="flex-1"
              >
                {changingPassword ? (
                  <>
                    <Loader size="md" />
                    <span>Modification...</span>
                  </>
                ) : (
                  'Modifier le mot de passe'
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={closeForm}
                disabled={changingPassword}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
