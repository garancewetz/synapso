'use client';

import { ActionButton } from './ActionButton';

import type { MouseEventHandler } from 'react';

type Props = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  variant?: 'fixed' | 'inline';
  position?: 'left' | 'right';
  label?: string;
  ariaLabel?: string;
  emoji?: string;
  iconPosition?: 'left' | 'right';
  className?: string;
};

export function ProgressButton({
  onClick,
  variant = 'inline',
  position = 'right',
  label = 'Ajouter',
  ariaLabel,
  emoji,
  iconPosition = 'left',
  className,
}: Props) {
  const isAddProgressButton = label === 'Ajouter un progrès' || !label;

  return (
    <ActionButton
      variant={isAddProgressButton ? 'golden' : 'simple'}
      layout={variant}
      position={position}
      label={label}
      onClick={onClick}
      aria-label={ariaLabel ?? 'Noter un progrès'}
      icon={emoji}
      iconPosition={iconPosition}
      className={className}
    />
  );
}

