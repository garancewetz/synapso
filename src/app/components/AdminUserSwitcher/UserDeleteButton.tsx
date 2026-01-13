'use client';

import { Button } from '@/app/components/ui/Button';
import { useDeleteConfirmation } from '@/app/hooks/useDeleteConfirmation';
import clsx from 'clsx';

type Props = {
  onDelete: () => Promise<void>;
  disabled?: boolean;
  className?: string;
};

export function UserDeleteButton({ onDelete, disabled = false, className = '' }: Props) {
  const deleteConfirmation = useDeleteConfirmation({ resetDelay: 3000 });

  return (
    <Button
      type="button"
      onClick={() => deleteConfirmation.handleClick(onDelete)}
      disabled={disabled || deleteConfirmation.isDeleting}
      variant={deleteConfirmation.showConfirm ? 'danger' : 'danger-outline'}
      size="sm"
      rounded="lg"
      className={clsx('!w-9 !h-9 !p-0 !text-xs !min-w-0', className)}
    >
      {deleteConfirmation.isDeleting ? (
        <span className="animate-spin">⏳</span>
      ) : deleteConfirmation.showConfirm ? (
        '⚠️'
      ) : (
        '🗑️'
      )}
    </Button>
  );
}

