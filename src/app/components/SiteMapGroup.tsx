import type { ReactNode } from 'react';
import clsx from 'clsx';
import { TouchLink } from '@/app/components/TouchLink';

type Props = {
  /** Titre du groupe parent */
  title: string;
  /** Icône du parent */
  icon: string | ReactNode;
  /** Description du parent */
  description: string;
  /** Lien du parent */
  href: string;
  /** Couleur de fond de l'icône */
  iconBgColor?: string;
  /** Couleur du texte de l'icône */
  iconTextColor?: string;
  /** Cartes enfants à afficher dans la grille */
  children: ReactNode;
};

/**
 * Groupe de navigation avec parent et enfants dans un même conteneur
 * Le parent est cliquable, les enfants sont affichés dans une grille en dessous
 */
export function SiteMapGroup({
  title,
  icon,
  description,
  href,
  iconBgColor = 'bg-gradient-to-br from-gray-100 to-gray-200',
  iconTextColor = 'text-gray-700',
  children,
}: Props) {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden">
      {/* Parent cliquable */}
      <TouchLink
        href={href}
        className={clsx(
          'group flex items-center gap-3 px-4 py-4 transition-all duration-200',
          'md:hover:bg-gray-50 active:scale-[0.98]',
          'md:hover:ring-2 md:hover:ring-gray-300/50 md:hover:ring-offset-2',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400'
        )}
      >
        {/* Icône */}
        <span className={clsx(
          'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
          'shadow-md',
          iconBgColor
        )}>
          {typeof icon === 'string' ? (
            <span 
              className={clsx(
                'text-2xl flex items-center justify-center',
                iconTextColor
              )} 
              role="img" 
              aria-hidden="true"
            >
              {icon}
            </span>
          ) : (
            <span className={clsx(
              'w-6 h-6 flex items-center justify-center',
              iconTextColor
            )}>
              {icon}
            </span>
          )}
        </span>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <span className="block font-semibold text-base text-gray-900">
            {title}
          </span>
          <p className="text-xs text-gray-500 mt-0.5">
            {description}
          </p>
        </div>

        {/* Indicateur de lien */}
        <span className="text-gray-300 group-hover:text-gray-400 transition-colors text-lg">
          →
        </span>
      </TouchLink>

      {/* Séparateur */}
      <div className="border-t border-gray-100" />

      {/* Liste des enfants */}
      <div className="bg-gray-50/50 p-3">
        <div className="flex flex-col gap-2">
          {children}
        </div>
      </div>
    </div>
  );
}

