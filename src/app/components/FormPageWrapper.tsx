'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronIcon } from '@/app/components/ui/icons';

interface FormPageWrapperProps {
  children: React.ReactNode;
  title?: string;
  backHref?: string;
  backLabel?: string;
}

export default function FormPageWrapper({ children, title, backHref, backLabel }: FormPageWrapperProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const isHomeLink = backHref === '/';
  const label = backLabel || (isHomeLink ? '🏠 Accueil' : 'Retour');

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 bg-gray-50">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 sm:p-6">
          {backHref ? (
            <Link
              href={backHref}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="Retour"
            >
              <ChevronIcon className="w-5 h-5" direction="left" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ) : (
            <button
              onClick={handleBack}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="Retour"
            >
              <ChevronIcon className="w-5 h-5" direction="left" />
              <span className="text-sm font-medium">Retour</span>
            </button>
          )}
          {title && (
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{title}</h1>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

