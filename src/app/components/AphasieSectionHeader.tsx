'use client';

import clsx from 'clsx';
import { AddButton } from '@/app/components/ui/AddButton';
import { useHandPreference } from '@/app/hooks/useHandPreference';

type Props = {
  title?: string;
  emoji?: string;
  addHref: string;
  addLabel: string;
  hideAddButton?: boolean;
};

/**
 * En-tête de section pour les pages aphasie avec titre et bouton d'ajout
 */
export function AphasieSectionHeader({ 
  title, 
  emoji, 
  addHref, 
  addLabel,
  hideAddButton = false
}: Props) {
  const { isLeftHanded } = useHandPreference();

  if (!title && !emoji) {
    // Si pas de titre, juste le bouton aligné selon la préférence
    return (
      <div className={clsx('flex justify-end', isLeftHanded && 'justify-start')}>
        <AddButton href={addHref} label={addLabel} />
      </div>
    );
  }

  return (
    <div className={clsx('flex items-center justify-between mb-4', isLeftHanded && 'flex-row-reverse')}>
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
        {emoji && <span>{emoji}</span>}
        {title && <span>{title}</span>}
      </h2>
      {!hideAddButton && <AddButton href={addHref} label={addLabel} />}
    </div>
  );
}

