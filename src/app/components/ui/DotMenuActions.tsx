import { EditIcon, ShareIcon, BookmarkIcon } from './icons';

type DotMenuActionsProps = {
  onArchive?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
  onPin?: () => void;
  isArchived?: boolean;
  isPinned?: boolean;
  onActionClick: (action: (() => void) | undefined) => (e?: React.MouseEvent) => void;
  variant?: 'dropdown' | 'bottomsheet';
  layout?: 'stack' | 'grid';
};

/**
 * Composant partagé pour afficher les actions du menu
 * Utilisé par DotMenu et DotMenuBottomSheet
 */
export function DotMenuActions({
  onArchive,
  onEdit,
  onShare,
  onPin,
  isArchived = false,
  isPinned = false,
  onActionClick,
  variant = 'dropdown',
  layout = 'stack',
}: DotMenuActionsProps) {
  const isDropdown = variant === 'dropdown';
  const isGrid = layout === 'grid';
  const buttonClassName = isDropdown
    ? 'w-full px-5 py-3.5 text-left flex flex-col items-center justify-center gap-1.5 text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150 focus:outline-none focus:bg-gray-50 min-h-[44px]'
    : 'w-full px-4 py-3.5 text-left flex items-center gap-3 text-base text-gray-700 rounded-lg bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  const buttonClassNameGrid = isGrid
    ? 'w-full px-2 py-3 flex flex-col items-center justify-center gap-1 text-center text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150 focus:outline-none focus:bg-gray-50 min-h-[44px]'
    : buttonClassName;
  const iconSize = isDropdown || isGrid ? 'w-5 h-5' : 'w-5 h-5';
  const textClassName = isDropdown && !isGrid ? '' : 'font-medium';

  const editButton = onEdit && (
    <button
      type="button"
      onClick={onActionClick(onEdit)}
      className={isGrid ? buttonClassNameGrid : buttonClassName}
      role={isDropdown ? 'menuitem' : undefined}
    >
      <EditIcon className={iconSize} />
      <span className={textClassName}>Modifier</span>
    </button>
  );

  const shareButton = onShare && (
    <button
      type="button"
      onClick={onActionClick(onShare)}
      className={isGrid ? buttonClassNameGrid : buttonClassName}
      role={isDropdown ? 'menuitem' : undefined}
    >
      <ShareIcon className={iconSize} />
      <span className={textClassName}>Partager</span>
    </button>
  );

  const pinLabel = isPinned ? 'Démarquer' : (isGrid ? 'Pour le kiné' : 'Marquer pour le kiné');

  const pinButton = onPin && (
    <button
      type="button"
      onClick={onActionClick(onPin)}
      className={isGrid ? buttonClassNameGrid : buttonClassName}
      role={isDropdown ? 'menuitem' : undefined}
    >
      <BookmarkIcon className={iconSize} filled={isPinned} />
      <span className={textClassName}>{pinLabel}</span>
    </button>
  );

  const archiveButton = onArchive && (
    <button
      type="button"
      onClick={onActionClick(onArchive)}
      className={isGrid ? buttonClassNameGrid : buttonClassName}
      role={isDropdown ? 'menuitem' : undefined}
    >
      <span className={isDropdown && !isGrid ? 'text-base' : 'text-xl'}>
        {isArchived ? '📤' : '📦'}
      </span>
      <span className={textClassName}>{isArchived ? 'Désarchiver' : 'Archiver'}</span>
    </button>
  );

  const gridItems = [editButton, pinButton, shareButton, archiveButton].filter(Boolean);
  const is2x2 = gridItems.length === 4;

  if (isGrid) {
    if (is2x2) {
      return (
        <div className="grid grid-cols-2">
          <div className="border-r border-b border-gray-200">{editButton}</div>
          <div className="border-b border-gray-200">{pinButton}</div>
          <div className="border-r border-gray-200">{shareButton}</div>
          <div>{archiveButton}</div>
        </div>
      );
    }
    return (
      <div className={`grid ${gridItems.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'} divide-x divide-gray-200`}>
        {editButton}
        {pinButton}
        {shareButton}
        {archiveButton}
      </div>
    );
  }

  return (
    <>
      {editButton}
      {pinButton}
      {shareButton}
      {archiveButton}
    </>
  );
}
