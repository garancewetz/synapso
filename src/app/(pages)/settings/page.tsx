'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/contexts/UserContext';
import { useOnboarding } from '@/app/hooks/useOnboarding';

import { Button } from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import ErrorMessage from '@/app/components/ErrorMessage';
import Loader from '@/app/components/ui/Loader';
import { SegmentedControl } from '@/app/components/ui/SegmentedControl';
import { BackButton } from '@/app/components/BackButton';
import { OnboardingSlides } from '@/app/components/OnboardingSlides';

type ResetFrequency = 'DAILY' | 'WEEKLY';
type DominantHand = 'LEFT' | 'RIGHT';

export default function SettingsPage() {
  const router = useRouter();
  const { effectiveUser, currentUser, isAdmin, updateEffectiveUser, logout, deleteAccount } = useUser();
  const { openOnboarding, showOnboarding, closeOnboarding } = useOnboarding();
  
  // Déterminer quel utilisateur on modifie (effectiveUser pour admin en mode impersonation)
  const userToEdit = effectiveUser;
  const isImpersonating = isAdmin && effectiveUser && currentUser && effectiveUser.id !== currentUser.id;
  
  // Pré-remplir avec le nom de l'utilisateur effectif immédiatement
  const [name, setName] = useState(userToEdit?.name || '');
  const [resetFrequency, setResetFrequency] = useState<ResetFrequency>(
    (userToEdit?.resetFrequency as ResetFrequency) || 'DAILY'
  );
  const [dominantHand, setDominantHand] = useState<DominantHand>(
    (userToEdit?.dominantHand as DominantHand) || 'RIGHT'
  );
  const [isAphasic, setIsAphasic] = useState<boolean>(
    userToEdit?.isAphasic ?? false
  );
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // État pour le changement de mot de passe
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Valeurs initiales pour détecter les changements
  const [initialValues, setInitialValues] = useState<{
    name: string;
    resetFrequency: ResetFrequency;
    dominantHand: DominantHand;
    isAphasic: boolean;
  } | null>(null);

  useEffect(() => {
    if (userToEdit) {
      // Utiliser directement les données du contexte (déjà chargées depuis l'API)
      const loadedName = userToEdit.name || '';
      const loadedResetFrequency = (userToEdit.resetFrequency as ResetFrequency) || 'DAILY';
      const loadedDominantHand = (userToEdit.dominantHand as DominantHand) || 'RIGHT';
      const loadedIsAphasic = userToEdit.isAphasic ?? false;
      
      setName(loadedName);
      setResetFrequency(loadedResetFrequency);
      setDominantHand(loadedDominantHand);
      setIsAphasic(loadedIsAphasic);
      
      // Sauvegarder les valeurs initiales
      setInitialValues({
        name: loadedName,
        resetFrequency: loadedResetFrequency,
        dominantHand: loadedDominantHand,
        isAphasic: loadedIsAphasic,
      });
      
      setInitialLoading(false);
    }
  }, [userToEdit]);
  
  // Détecter si des changements ont été faits
  const hasUnsavedChanges = initialValues && (
    name !== initialValues.name ||
    resetFrequency !== initialValues.resetFrequency ||
    dominantHand !== initialValues.dominantHand ||
    isAphasic !== initialValues.isAphasic
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) {
      setError('Utilisateur non défini');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`/api/users/${userToEdit.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, resetFrequency, dominantHand, isAphasic }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      const updatedUser = await response.json();
      
      // Met à jour l'utilisateur effectif dans le contexte
      updateEffectiveUser(updatedUser);
      
      // Mettre à jour les valeurs initiales après sauvegarde
      setInitialValues({
        name: updatedUser.name || '',
        resetFrequency: (updatedUser.resetFrequency as ResetFrequency) || 'DAILY',
        dominantHand: (updatedUser.dominantHand as DominantHand) || 'RIGHT',
        isAphasic: updatedUser.isAphasic ?? false,
      });
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    
    const shouldLogout = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
    if (!shouldLogout) return;
    
    setLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
      setError('Erreur lors de la déconnexion');
      setLoggingOut(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    setChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess(false);

    // Validation côté client
    if (!currentPassword) {
      setPasswordError('Le mot de passe actuel est obligatoire');
      setChangingPassword(false);
      return;
    }

    if (!newPassword) {
      setPasswordError('Le nouveau mot de passe est obligatoire');
      setChangingPassword(false);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      setChangingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas');
      setChangingPassword(false);
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('Le nouveau mot de passe doit être différent de l\'ancien');
      setChangingPassword(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/${userToEdit.id}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la modification du mot de passe');
      }

      // Réinitialiser les champs
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
      setPasswordSuccess(true);
      
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Erreur:', err);
      setPasswordError(err instanceof Error ? err.message : 'Erreur lors de la modification du mot de passe');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userToEdit || isDeleting) return;

    // Première confirmation
    const firstConfirm = window.confirm(
      `⚠️ Attention : Cette action est irréversible !\n\n` +
      `Toutes vos données seront définitivement supprimées :\n` +
      `- Vos exercices\n` +
      `- Votre historique de progression\n` +
      `- Vos progrès et victoires\n` +
      `- Vos citations d'aphasie\n` +
      `- Vos exercices d'orthophonie\n\n` +
      `Êtes-vous absolument sûr de vouloir supprimer votre compte ?`
    );

    if (!firstConfirm) return;

    // Double confirmation : demander le nom
    const confirmName = window.prompt(
      `Pour confirmer, veuillez taper votre nom exactement comme il apparaît : "${userToEdit.name}"`
    );

    if (confirmName !== userToEdit.name) {
      setError('Le nom ne correspond pas. Suppression annulée.');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      await deleteAccount(userToEdit.id);
      // La redirection sera gérée par le contexte après déconnexion
      router.push('/');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du compte');
      setIsDeleting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="px-3 md:px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (!userToEdit) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="px-3 md:px-4">
          <div className="text-center py-8">
            <p className="text-gray-500">Utilisateur non trouvé</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-10 md:pb-8">
      <div className="px-3 sm:px-6">
        {/* Bouton retour */}
        <BackButton className="mb-4" buttonClassName="py-3" />

        {/* Titre */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Mon profil</h1>
        
        {/* Avertissement admin si impersonation */}
        {isImpersonating && (
          <div className="p-4 mb-6 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-purple-700 text-sm font-medium flex items-center gap-2">
              <span>👁️</span>
              <span>Vous consultez le profil de <strong>{userToEdit.name}</strong></span>
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <ErrorMessage message={error} />
          
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-emerald-700 text-sm font-medium">
                ✓ Profil enregistré avec succès
              </p>
            </div>
          )}
          
          {hasUnsavedChanges && !success && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-700 text-sm font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>N&apos;oubliez pas d&apos;enregistrer vos changements</span>
              </p>
            </div>
          )}

          {/* Section Nom */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <Input
              label="Nom de l'utilisateur"
              type="text"
              required
              placeholder="Ex: Calypso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Section Préférence de main */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Préférence de main
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Choisissez votre préférence de main pour positionner les boutons principaux (menu, victoire, etc.) du bon côté
            </p>
            
            <SegmentedControl
              options={[
                { value: 'LEFT', label: '🤚 Gauche' },
                { value: 'RIGHT', label: '✋ Droite' },
              ]}
              value={dominantHand}
              onChange={(value) => setDominantHand(value as DominantHand)}
              fullWidth
              size="md"
              variant="filter"
              className="bg-gray-50 border-2 border-gray-200"
              activeRingColor="ring-amber-400"
            />
          </div>

          {/* Section Aphasie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Journal d&apos;aphasie
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Activez cette option si vous souhaitez accéder au journal d&apos;aphasie pour suivre vos citations et exercices
            </p>
            
            <SegmentedControl
              options={[
                { value: 'YES', label: '✓ Oui' },
                { value: 'NO', label: '✗ Non' },
              ]}
              value={isAphasic ? 'YES' : 'NO'}
              onChange={(value) => setIsAphasic(value === 'YES')}
              fullWidth
              size="md"
              variant="filter"
              className="bg-gray-50 border-2 border-gray-200"
              activeRingColor="ring-purple-500"
            />
          </div>

          {/* Section Réinitialisation */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Réinitialisation des exercices
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Choisissez la fréquence de réinitialisation des exercices complétés
            </p>
            
            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-2 cursor-pointer transition-all ${
                resetFrequency === 'DAILY' 
                  ? 'border-amber-400 bg-amber-50' 
                  : 'border-gray-200 hover:border-amber-300'
              }`}>
                <input
                  type="radio"
                  name="resetFrequency"
                  value="DAILY"
                  checked={resetFrequency === 'DAILY'}
                  onChange={(e) => setResetFrequency(e.target.value as ResetFrequency)}
                  className="mt-1 w-5 h-5 text-amber-600 focus:ring-amber-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">Tous les jours</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Les exercices complétés sont réinitialisés chaque jour à minuit
                  </div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-2 cursor-pointer transition-all ${
                resetFrequency === 'WEEKLY' 
                  ? 'border-amber-400 bg-amber-50' 
                  : 'border-gray-200 hover:border-amber-300'
              }`}>
                <input
                  type="radio"
                  name="resetFrequency"
                  value="WEEKLY"
                  checked={resetFrequency === 'WEEKLY'}
                  onChange={(e) => setResetFrequency(e.target.value as ResetFrequency)}
                  className="mt-1 w-5 h-5 text-amber-600 focus:ring-amber-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">Une fois par semaine</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Les exercices complétés sont réinitialisés chaque dimanche à minuit
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading}
              className={`flex-1 ${hasUnsavedChanges ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
            >
              {loading ? (
                <>
                  <Loader size="small" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                'Enregistrer mon profil'
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (hasUnsavedChanges) {
                  const shouldLeave = window.confirm('Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter ?');
                  if (shouldLeave) {
                    router.push('/');
                  }
                } else {
                  router.push('/');
                }
              }}
              disabled={loading}
            >
              {hasUnsavedChanges ? 'Quitter' : 'Annuler'}
            </Button>
          </div>
        </form>

        {/* Section Aide */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Aide</h2>
          <Button
            type="button"
            variant="secondary"
            onClick={openOnboarding}
            className="w-full sm:w-auto"
          >
            <span>📖</span>
            <span>Voir le guide d&apos;introduction</span>
          </Button>
        </div>

        {/* Section Changement de mot de passe (uniquement si pas en mode impersonation) */}
        {!isImpersonating && (
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
              <form onSubmit={handleChangePassword} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-800">Changer mon mot de passe</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError('');
                    }}
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
                        <Loader size="small" />
                        <span>Modification...</span>
                      </>
                    ) : (
                      'Modifier le mot de passe'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowChangePassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError('');
                    }}
                    disabled={changingPassword}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Section Déconnexion (uniquement si pas en mode impersonation) */}
        {!isImpersonating && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Session</h2>
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="danger-outline"
                onClick={handleLogout}
                disabled={loggingOut || isDeleting}
                className="w-full sm:w-auto"
              >
                {loggingOut ? (
                  <>
                    <Loader size="small" />
                    <span>Déconnexion...</span>
                  </>
                ) : (
                  <>
                    <span>👋</span>
                    <span>Se déconnecter</span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={isDeleting || loggingOut}
                className="w-full sm:w-auto"
                aria-label="Supprimer mon compte"
              >
                {isDeleting ? (
                  <>
                    <Loader size="small" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <span>Supprimer mon compte</span>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Onboarding pour réconsultation */}
      <OnboardingSlides
        isOpen={showOnboarding}
        onClose={closeOnboarding}
        markAsSeenOnClose={false}
      />
    </div>
  );
}
