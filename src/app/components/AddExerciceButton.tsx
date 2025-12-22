'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExerciceCategory } from '@/app/types/exercice';
import { PlusIcon } from '@/app/components/ui/icons';

interface AddExerciceButtonProps {
  className?: string;
  size?: 'small' | 'medium';
  category?: ExerciceCategory;
}

export default function AddExerciceButton({ className = '', category }: AddExerciceButtonProps) {
  const pathname = usePathname();
  
  const params = new URLSearchParams();
  if (category) params.set('category', category.toLowerCase());
  params.set('from', pathname);
  
  const href = `/exercice/add?${params.toString()}`;

  return (
    <Link
      href={href}
      className={`w-8 h-8 flex items-center justify-center rounded-lg border-2 border-gray-800 bg-transparent hover:bg-gray-50 transition-colors ${className}`}
      aria-label="Ajouter un exercice"
    >
      <PlusIcon className="w-5 h-5 text-gray-800" strokeWidth={2.5} />
    </Link>
  );
}

