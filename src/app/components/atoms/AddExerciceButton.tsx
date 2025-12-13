'use client';

import Link from 'next/link';
import { ExerciceCategory } from '@/types/exercice';

interface AddExerciceButtonProps {
  className?: string;
  size?: 'small' | 'medium';
  category?: ExerciceCategory;
}

export default function AddExerciceButton({ className = '', category }: AddExerciceButtonProps) {
  
  const href = category 
    ? `/exercice/add?category=${category.toLowerCase()}`
    : '/exercice/add';

  return (
    <Link
      href={href}
      className={`w-8 h-8 flex items-center justify-center rounded-lg border-2 border-gray-800 bg-transparent hover:bg-gray-50 transition-colors ${className}`}
      aria-label="Ajouter un exercice"
    >
      <svg 
        className="w-5 h-5 text-gray-800"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
      </svg>
    </Link>
  );
}

