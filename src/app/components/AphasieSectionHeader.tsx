'use client';

import { cn } from '@/app/utils/cn';
import AddButton from '@/app/components/ui/AddButton';
import { useHandPreference } from '@/app/hooks/useHandPreference';

interface AphasieSectionHeaderProps {
  title?: string;
  emoji?: string;
  addHref: string;
  addLabel: string;
}

/**
 * En-tête de section pour les pages aphasie avec titre et bouton d'ajout
 */
export default function AphasieSectionHeader({ 
  title, 
  emoji, 
  addHref, 
  addLabel 
}: AphasieSectionHeaderProps) {
  const { isLeftHanded } = useHandPreference();

  if (!title && !emoji) {
    // Si pas de titre, juste le bouton aligné selon la préférence
    return (
      <div className={cn('flex justify-end', isLeftHanded && 'justify-start')}>
        <AddButton href={addHref} label={addLabel} />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-between mb-4', isLeftHanded && 'flex-row-reverse')}>
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
        {emoji && <span>{emoji}</span>}
        {title && <span>{title}</span>}
      </h2>
      <AddButton href={addHref} label={addLabel} />
    </div>
  );
}

