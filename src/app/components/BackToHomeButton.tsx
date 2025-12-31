'use client';

import Link from 'next/link';
import { ChevronIcon } from '@/app/components/ui/icons';

export default function BackToHomeButton() {
  return (
    <div className="px-3 sm:px-6 mb-2">
      <Link 
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        aria-label="Retour à l'accueil"
      >
        <ChevronIcon direction="left" className="w-5 h-5" />
        <span>🏠 Retour</span>
      </Link>
    </div>
  );
}

