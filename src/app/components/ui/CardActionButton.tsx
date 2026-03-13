import type { ReactNode, MouseEventHandler } from 'react';
import clsx from 'clsx';

type CardActionButtonColor = 'gray' | 'neutral' | 'amber';

type Props = {
  /** Icône affichée au-dessus du label (composant React ou emoji string) */
  icon: ReactNode;
  /** Label textuel sous l'icône */
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  /** Palette de couleurs (gray = exercices, neutral = journal, amber = progrès) */
  color?: CardActionButtonColor;
  /** Classes CSS additionnelles (bordures de grille, col-span, etc.) */
  className?: string;
  'aria-label'?: string;
};

const colorStyles: Record<CardActionButtonColor, string> = {
  gray: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
  neutral: 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200',
  amber: 'text-amber-800 hover:bg-amber-100 active:bg-amber-200',
};

/**
 * Bouton d'action pour les grilles d'actions des cartes (ExerciceCard, JournalNoteCard, ProgressCard).
 * Layout vertical : icône + label. Conçu pour être placé dans un `grid grid-cols-2`.
 */
export function CardActionButton({
  icon,
  label,
  onClick,
  disabled = false,
  color = 'gray',
  className,
  'aria-label': ariaLabel,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'px-2 py-3 flex flex-col items-center justify-center gap-1',
        'text-center text-sm font-medium',
        'transition-colors min-h-[44px]',
        'disabled:opacity-50 disabled:pointer-events-none',
        colorStyles[color],
        className,
      )}
      aria-label={ariaLabel}
    >
      <span className="flex items-center justify-center w-5 h-5 shrink-0">
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}
