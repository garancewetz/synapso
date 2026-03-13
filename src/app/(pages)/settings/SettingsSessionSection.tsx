import { Button } from '@/app/components/ui/Button';
import { Loader } from '@/app/components/ui/Loader';

type Props = {
  onLogout: () => void;
  onDeleteAccount: () => void;
  loggingOut: boolean;
  isDeleting: boolean;
};

export function SettingsSessionSection({
  onLogout,
  onDeleteAccount,
  loggingOut,
  isDeleting,
}: Props) {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Session</h2>
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="danger-outline"
          onClick={onLogout}
          disabled={loggingOut || isDeleting}
          className="w-full sm:w-auto"
        >
          {loggingOut ? (
            <>
              <Loader size="md" />
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
          onClick={onDeleteAccount}
          disabled={isDeleting || loggingOut}
          className="w-full sm:w-auto"
          aria-label="Supprimer mon compte"
        >
          {isDeleting ? (
            <>
              <Loader size="md" />
              <span>Suppression...</span>
            </>
          ) : (
            <span>Supprimer mon compte</span>
          )}
        </Button>
      </div>
    </div>
  );
}
