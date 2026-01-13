'use client';

import { TouchLink } from '@/app/components/TouchLink';
import { usePathname } from 'next/navigation';
import { PlusIcon } from './icons';
import { Button } from './Button';
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
export function AddButton({ 
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
    <TouchLink 
      href={finalHref}
      className={clsx('inline-block', className)}
      aria-label={label || 'Ajouter'}
    >
      <Button
        variant="primary"
        icon={<PlusIcon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={3} />}
        rounded="full"
        size="md"
        className={clsx(
          'w-auto h-12 md:h-14 px-4 md:px-5 bg-gray-800 hover:bg-gray-700 shadow-md',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400'
        )}
      >
        {label && (
          <span className="whitespace-nowrap">
            Ajouter
          </span>
        )}
      </Button>
    </TouchLink>
  );
}

