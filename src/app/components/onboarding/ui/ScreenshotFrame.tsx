'use client';

import type { PropsWithChildren } from 'react';
import clsx from 'clsx';

type Props = PropsWithChildren<{
  /** Largeur du header skeleton (ex: '32', '40', '48') */
  headerWidth?: '32' | '40' | '48';
  /** Hauteur minimale du conteneur */
  minHeight?: '300' | '400';
  /** Si true, permet overflow visible pour les annotations */
  overflowVisible?: boolean;
  /** Classes additionnelles */
  className?: string;
}>;

/**
 * Composant pour simuler une capture d'écran avec bordure et ombre
 * Utilisé dans les slides d'onboarding pour montrer des interfaces annotées
 */
const headerWidthClasses = {
  '32': 'w-32',
  '40': 'w-40',
  '48': 'w-48',
} as const;

const minHeightClasses = {
  '300': 'min-h-[300px]',
  '400': 'min-h-[400px]',
} as const;

export function ScreenshotFrame({
  children,
  headerWidth = '40',
  minHeight,
  overflowVisible = false,
  className,
}: Props) {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg border-4 border-gray-300 shadow-2xl p-4 md:p-6',
        minHeight && minHeightClasses[minHeight],
        overflowVisible && 'overflow-visible',
        className
      )}
    >
      {/* Header simulé */}
      <div className="mb-4 pb-3 border-b border-gray-200">
        <div className={clsx('h-6 bg-gray-200 rounded animate-pulse', headerWidthClasses[headerWidth])} />
      </div>
      {children}
    </div>
  );
}

