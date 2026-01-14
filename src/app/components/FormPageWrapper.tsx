'use client';

import { usePageFocus } from '@/app/hooks/usePageFocus';
import { BackButton } from '@/app/components/ui/BackButton';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  title?: string;
  backHref?: string;
  backLabel?: string;
};

export function FormPageWrapper({ children, title, backHref, backLabel }: Props) {
  // Placer le focus sur le premier élément focusable de la page (excluant le menu fermé)
  // Priorité aux inputs et textareas pour les pages de formulaire
  usePageFocus({
    selector: 'input:not([disabled]):not([type="hidden"]), textarea:not([disabled])',
    excludeMenu: true,
  });

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-0 md:pb-8">
      {/* Bouton retour */}
      <BackButton backHref={backHref} backLabel={backLabel} className="mb-4" />

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

