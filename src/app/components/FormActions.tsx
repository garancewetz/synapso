import Button from '@/app/components/ui/Button';

type Props = {
  loading?: boolean;
  onSubmitLabel?: string;
  onCancel?: () => void;
  onCancelLabel?: string;
  showDelete?: boolean;
  onDelete?: () => void;
  deleteConfirm?: boolean;
  deleteLabel?: string;
  deleteConfirmLabel?: string;
};

export default function FormActions({
  loading = false,
  onSubmitLabel = 'Enregistrer',
  onCancel,
  onCancelLabel = 'Annuler',
  showDelete = false,
  onDelete,
  deleteConfirm = false,
  deleteLabel = 'Supprimer',
  deleteConfirmLabel = '⚠️ Confirmer la suppression',
}: Props) {
  return (
    <div className="space-y-3 pt-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="submit"
          variant="action"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Enregistrement...' : onSubmitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            {onCancelLabel}
          </Button>
        )}
      </div>

      {showDelete && onDelete && (
        <Button
          type="button"
          variant={deleteConfirm ? 'danger' : 'danger-outline'}
          onClick={onDelete}
          disabled={loading}
          className="w-full"
        >
          {deleteConfirm ? deleteConfirmLabel : deleteLabel}
        </Button>
      )}
    </div>
  );
}
