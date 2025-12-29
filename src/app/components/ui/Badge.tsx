import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'workout' | 'equipment';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  color?: string;
  icon?: string;
  className?: string;
}

// Classes de base communes à tous les badges
const baseClasses = 'text-xs px-2.5 py-1 rounded-md font-medium';

// Classes de couleur par défaut (gris)
const defaultColorClasses = 'bg-gray-100 text-gray-800';

export function Badge({ 
  children, 
  icon,
  className = '' 
}: BadgeProps) {
  // Si un className est fourni avec des classes de couleur, on n'applique pas les couleurs par défaut
  const hasCustomColors = className.includes('bg-') || className.includes('text-');
  const colorClasses = hasCustomColors ? '' : defaultColorClasses;
  
  return (
    <span className={`${baseClasses} ${colorClasses} ${className}`}>
      {icon && <span>{icon} </span>}
      {children}
    </span>
  );
}

