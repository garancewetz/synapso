import { EditIcon, ShareIcon } from './icons';

type DotMenuActionsProps = {
  onArchive?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
  isArchived?: boolean;
  onActionClick: (action: (() => void) | undefined) => (e?: React.MouseEvent) => void;
  variant?: 'dropdown' | 'bottomsheet';
};

/**
 * Composant partagé pour afficher les actions du menu
 * Utilisé par DotMenu et DotMenuBottomSheet
 */
export function DotMenuActions({
  onArchive,
  onEdit,
  onShare,
  isArchived = false,
  onActionClick,
  variant = 'dropdown',
}: DotMenuActionsProps) {
  const isDropdown = variant === 'dropdown';
  const buttonClassName = isDropdown
    ? 'w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150 focus:outline-none focus:bg-gray-50'
    : 'w-full px-4 py-3.5 text-left flex items-center gap-3 text-base text-gray-700 rounded-lg bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  const iconSize = isDropdown ? 'w-4 h-4' : 'w-5 h-5';
  const textClassName = isDropdown ? '' : 'font-medium';

  return (
    <>
      {onEdit && (
        <button
          type="button"
          onClick={onActionClick(onEdit)}
          className={buttonClassName}
          role={isDropdown ? 'menuitem' : undefined}
        >
          <EditIcon className={iconSize} />
          <span className={textClassName}>Modifier</span>
        </button>
      )}

      {onShare && (
        <button
          type="button"
          onClick={onActionClick(onShare)}
          className={buttonClassName}
          role={isDropdown ? 'menuitem' : undefined}
        >
          <ShareIcon className={iconSize} />
          <span className={textClassName}>Partager</span>
        </button>
      )}

      {onArchive && (
        <button
          type="button"
          onClick={onActionClick(onArchive)}
          className={buttonClassName}
          role={isDropdown ? 'menuitem' : undefined}
        >
          <span className={isDropdown ? 'text-base' : 'text-xl'}>
            {isArchived ? '📤' : '📦'}
          </span>
          <span className={textClassName}>{isArchived ? 'Désarchiver' : 'Archiver'}</span>
        </button>
      )}
    </>
  );
}
