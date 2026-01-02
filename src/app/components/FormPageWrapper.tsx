'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronIcon } from '@/app/components/ui/icons';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { usePageFocus } from '@/app/hooks/usePageFocus';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  title?: string;
  backHref?: string;
  backLabel?: string;
};

export default function FormPageWrapper({ children, title, backHref, backLabel }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    router.back();
  };

  // Afficher "🏠 Retour" si on retourne vers l'accueil ou si on est sur la page de création d'exercice
  const isHomeLink = backHref === '/' || pathname === '/exercice/add';
  const label = backLabel || (isHomeLink ? `${NAVIGATION_EMOJIS.HOME} Retour` : 'Retour');

  // Placer le focus sur le premier élément focusable de la page (excluant le menu fermé)
  // Priorité aux inputs et textareas pour les pages de formulaire
  usePageFocus({
    selector: 'input:not([disabled]):not([type="hidden"]), textarea:not([disabled])',
    excludeMenu: true,
  });

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-0 md:pb-8">
      {/* Bouton retour */}
      <div className="px-3 sm:px-6 mb-2">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Retour"
          >
            <ChevronIcon className="w-5 h-5" direction="left" />
            <span>{label}</span>
          </Link>
        ) : (
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Retour"
          >
            <ChevronIcon className="w-5 h-5" direction="left" />
            <span>Retour</span>
          </button>
        )}
      </div>

      <div className="px-3 sm:p-6 bg-gray-50">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 sm:p-6">
            {title && (
              <h1 className="text-2xl font-bold text-gray-800 mb-6">{title}</h1>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

