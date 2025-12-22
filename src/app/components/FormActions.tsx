interface FormActionsProps {
  loading?: boolean;
  onSubmitLabel?: string;
  onCancel?: () => void;
  onCancelLabel?: string;
  showDelete?: boolean;
  onDelete?: () => void;
  deleteConfirm?: boolean;
  deleteLabel?: string;
  deleteConfirmLabel?: string;
}

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
}: FormActionsProps) {
  return (
    <div className="space-y-3 pt-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Enregistrement...' : onSubmitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {onCancelLabel}
          </button>
        )}
      </div>

      {showDelete && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            deleteConfirm
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-300'
          }`}
        >
          {deleteConfirm ? deleteConfirmLabel : deleteLabel}
        </button>
      )}
    </div>
  );
}
