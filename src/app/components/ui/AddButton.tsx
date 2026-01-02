'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusIcon } from './icons';
import clsx from 'clsx';

type Props = {
  href: string;
  label?: string;
  className?: string;
  position?: 'left' | 'right' | 'auto';
  queryParams?: Record<string, string>;
  addFromParam?: boolean;
};

/**
 * Bouton rond avec plus pour ajouter des éléments
 * S'adapte automatiquement à la préférence de main de l'utilisateur
 */
export default function AddButton({ 
  href, 
  label, 
  className = '',
  queryParams,
  addFromParam = false
}: Props) {
  const pathname = usePathname();

  // Construire l'URL avec les paramètres de requête
  let finalHref = href;
  if (queryParams || addFromParam) {
    const params = new URLSearchParams();
    
    // Ajouter les paramètres personnalisés
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        params.set(key, value);
      });
    }
    
    // Ajouter le paramètre 'from' si demandé
    if (addFromParam && pathname) {
      params.set('from', pathname);
    }
    
    finalHref = `${href}?${params.toString()}`;
  }

  return (
    <Link 
      href={finalHref}
      className={clsx(
        'inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14',
        'bg-gray-800 hover:bg-gray-700',
        'rounded-full shadow-md',
        'cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
        className
      )}
      aria-label={label || 'Ajouter'}
    >
      <PlusIcon 
        className="text-white w-6 h-6 md:w-7 md:h-7" 
        strokeWidth={3} 
      />
    </Link>
  );
}

