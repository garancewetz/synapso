import type { ReactNode } from 'react';
import clsx from 'clsx';

type BadgeVariant = 'default' | 'workout' | 'equipment' | 'completed' | 'mastered';

type Props = {
  children: ReactNode;
  /** Variante du badge : default (catégorie), workout (séries/répétitions), equipment (matériel), completed (exercice fait), mastered (exercice maîtrisé) */
  variant?: BadgeVariant;
  /** Icône optionnelle affichée avant le texte (string emoji ou composant React) */
  icon?: string | ReactNode;
  /** Classes CSS additionnelles (peuvent surcharger les couleurs par défaut) */
  className?: string;
};

// Classes de base communes à tous les badges
const baseClasses = 'text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1';

// Styles par variante
const variantStyles: Record<BadgeVariant, string> = {
  // Default : gris neutre, utilisé pour les bodyparts avec className de couleur
  default: 'bg-gray-100 text-gray-800',
  // Workout : slate pour les infos d'entraînement (séries, répétitions, durée)
  workout: 'bg-slate-100 text-slate-700',
  // Equipment : gris pour le matériel nécessaire
  equipment: 'bg-gray-100 text-gray-700 border border-gray-200',
  // Completed : vert émeraude pour exercice complété
  completed: 'bg-emerald-500/90 text-white border border-emerald-400/50',
  // Mastered : vert émeraude pour exercice maîtrisé
  mastered: 'bg-emerald-500 text-white',
};

export function Badge({ 
  children, 
  variant = 'default',
  icon,
  className = '' 
}: Props) {
  // Si un className est fourni avec des classes de couleur, on n'applique pas les couleurs de la variante
  const hasCustomColors = className.includes('bg-') || className.includes('text-');
  const colorClasses = hasCustomColors ? '' : variantStyles[variant];
  
  return (
    <span className={clsx(baseClasses, colorClasses, className)}>
      {icon && (
        <span className="shrink-0">
          {typeof icon === 'string' ? icon : icon}
        </span>
      )}
      {children}
    </span>
  );
}

