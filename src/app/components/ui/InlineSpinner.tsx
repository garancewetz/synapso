import clsx from 'clsx';

type InlineSpinnerColor = 'gray' | 'neutral' | 'amber' | 'emerald';

type Props = {
  /** Palette de couleurs du spinner */
  color?: InlineSpinnerColor;
  /** Taille (sm/md pour inline dans un bouton, lg/xl pour les loaders de page) */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const colorStyles: Record<InlineSpinnerColor, string> = {
  gray: 'border-gray-300 border-t-gray-600',
  neutral: 'border-neutral-300 border-t-neutral-600',
  amber: 'border-amber-300 border-t-amber-600',
  emerald: 'border-emerald-300 border-t-emerald-600',
};

const sizeStyles = {
  sm: 'w-4 h-4 border-[1.5px]',
  md: 'w-5 h-5 border-2',
  lg: 'w-8 h-8 border-2',
  xl: 'w-12 h-12 border-2',
};

/**
 * Spinner inline pour remplacer une icône pendant un chargement.
 * Conçu pour être utilisé comme prop `icon` de CardActionButton ou dans un Button.
 */
export function InlineSpinner({ color = 'gray', size = 'md', className }: Props) {
  return (
    <span
      className={clsx(
        'rounded-full animate-spin',
        sizeStyles[size],
        colorStyles[color],
        className,
      )}
      role="status"
      aria-label="Chargement"
    />
  );
}
