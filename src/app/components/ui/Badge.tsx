import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'workout' | 'equipment';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  color?: string;
  icon?: string;
  className?: string;
}


export function Badge({ 
  children, 
  icon,
  className = '' 
}: BadgeProps) {
  
  return (
    <span className={`text-xs px-2.5 py-1 rounded-md font-medium bg-gray-100 text-gray-800 ${className}`}>
      {icon && <span>{icon} </span>}
      {children}
    </span>
  );
}

