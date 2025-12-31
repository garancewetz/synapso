'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExerciceCategory } from '@/app/types/exercice';
import { PlusIcon } from '@/app/components/ui/icons';

interface AddExerciceButtonProps {
  className?: string;
  category?: ExerciceCategory;
  showLabel?: boolean;
}

export default function AddExerciceButton({ className = '', category, showLabel = false }: AddExerciceButtonProps) {
  const pathname = usePathname();
  
  const params = new URLSearchParams();
  if (category) params.set('category', category.toLowerCase());
  params.set('from', pathname);
  
  const href = `/exercice/add?${params.toString()}`;

  return (
    <Link
      href={href}
      className={`
        group relative
        inline-flex items-center justify-center gap-2
        ${showLabel ? 'px-5 py-3' : 'w-12 h-12 md:w-14 md:h-14'}
        bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900
        hover:from-gray-600 hover:via-gray-700 hover:to-gray-800
        rounded-full
        shadow-lg hover:shadow-xl hover:shadow-gray-900/30
        hover:scale-110 active:scale-95
        transition-all duration-300 ease-out
        cursor-pointer
        overflow-hidden
        focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-gray-400/50
        ${className}
      `}
      aria-label="Ajouter un exercice"
    >
      {/* Effet de brillance animé */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      
      {/* Contenu */}
      <div className="relative z-10 flex items-center justify-center">
        <PlusIcon 
          className={`text-white ${showLabel ? 'w-5 h-5' : 'w-6 h-6 md:w-7 md:h-7'} transition-transform duration-300 group-hover:rotate-90`} 
          strokeWidth={showLabel ? 2.5 : 3} 
        />
        {showLabel && (
          <span className="text-white font-bold text-sm md:text-base ml-1">
            Ajouter
          </span>
        )}
      </div>
      
      {/* Effet de glow au survol */}
      <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
    </Link>
  );
}

