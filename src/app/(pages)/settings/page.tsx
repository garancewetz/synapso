'use client';

import { BackButton } from '@/app/components/ui/BackButton';
import { Loader } from '@/app/components/ui/Loader';
import { SettingsProfilSection } from './SettingsProfilSection';
import { SettingsMenuCategorySection } from './SettingsMenuCategorySection';
import { SettingsPasswordSection } from './SettingsPasswordSection';
import { SettingsSessionSection } from './SettingsSessionSection';
import { useSettingsPage } from './useSettingsPage';

export default function SettingsPage() {
  const {
    userToEdit,
    isImpersonating,
    initialLoading,
    name,
    setName,
    resetFrequency,
    setResetFrequency,
    dominantHand,
    setDominantHand,
    hasUnsavedChanges,
    loading,
    error,
    success,
    handleSubmit,
    handleCancel,
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
    handleChangePassword,
    handleLogout,
    handleDeleteAccount,
    loggingOut,
    isDeleting,
  } = useSettingsPage();

  if (initialLoading) {
    return (
      <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 md:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader size="large" />
        </div>
      </div>
    );
  }

  if (!userToEdit) {
    return (
      <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 md:px-6 lg:px-8">
        <div className="text-center py-8">
          <p className="text-gray-500">Utilisateur non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto pt-2 md:pt-4 pb-10 md:pb-8 px-3 md:px-6 lg:px-8">
      <div className="sm:px-6">
        <BackButton className="mb-4" buttonClassName="py-3" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Mon profil</h1>

        {isImpersonating && (
          <div className="p-4 mb-6 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-purple-700 text-sm font-medium flex items-center gap-2">
              <span>👁️</span>
              <span>Vous consultez le profil de <strong>{userToEdit.name}</strong></span>
            </p>
          </div>
        )}

        <SettingsProfilSection
          name={name}
          setName={setName}
          resetFrequency={resetFrequency}
          setResetFrequency={setResetFrequency}
          dominantHand={dominantHand}
          setDominantHand={setDominantHand}
          hasUnsavedChanges={hasUnsavedChanges}
          loading={loading}
          error={error}
          success={success}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />

        <SettingsMenuCategorySection />

        {!isImpersonating && (
          <SettingsPasswordSection
            showChangePassword={showChangePassword}
            setShowChangePassword={setShowChangePassword}
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showPasswords={showPasswords}
            setShowPasswords={setShowPasswords}
            changingPassword={changingPassword}
            passwordError={passwordError}
            setPasswordError={setPasswordError}
            passwordSuccess={passwordSuccess}
            onChangePassword={handleChangePassword}
          />
        )}

        {!isImpersonating && (
          <SettingsSessionSection
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
            loggingOut={loggingOut}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </div>
  );
}
