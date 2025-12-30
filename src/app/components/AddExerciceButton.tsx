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
        inline-flex items-center justify-center gap-2
        ${showLabel ? 'px-4 py-2.5' : 'w-10 h-10'}
        bg-gray-700 hover:bg-gray-600
        rounded-full shadow-md
        hover:shadow-lg hover:scale-105
        active:scale-95
        transition-all duration-200
        cursor-pointer
        ${className}
      `}
      aria-label="Ajouter un exercice"
    >
      <PlusIcon className="w-5 h-5 text-white" strokeWidth={2.5} />
      {showLabel && (
        <span className="text-white font-semibold text-sm">Ajouter</span>
      )}
    </Link>
  );
}

