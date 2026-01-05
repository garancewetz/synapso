'use client';

import Link from 'next/link';
import { useCallback, useRef } from 'react';
import type { ReactNode, MouseEvent, PointerEvent } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  /** Précharger la route au survol (desktop) */
  prefetch?: boolean;
  /** Désactiver la navigation tactile optimisée */
  disableTouchOptimization?: boolean;
  [key: string]: unknown;
};

/**
 * Composant Link optimisé pour les interactions tactiles sur mobile
 * Résout le problème du double-clic en gérant correctement les événements touch
 * 
 * Utilise onPointerDown pour une meilleure réactivité sur mobile
 * tout en conservant la compatibilité avec les clics souris
 */
export function TouchLink({
  href,
  children,
  className,
  onClick,
  prefetch = true,
  disableTouchOptimization = false,
  ...props
}: Props) {
  const router = useRouter();
  const touchStartTimeRef = useRef<number | null>(null);
  const isNavigatingRef = useRef(false);

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLAnchorElement>) => {
      // Ne traiter que les événements touch pour éviter les conflits
      if (disableTouchOptimization || e.pointerType !== 'touch') {
        return;
      }

      // Empêcher le comportement par défaut pour éviter le double-tap zoom
      e.preventDefault();
      
      // Empêcher les navigations multiples rapides
      if (isNavigatingRef.current) {
        return;
      }

      touchStartTimeRef.current = Date.now();
      isNavigatingRef.current = true;

      // Appeler onClick si fourni
      onClick?.();

      // Navigation programmatique pour une meilleure réactivité
      router.push(href);

      // Réinitialiser après un court délai
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 300);
    },
    [href, onClick, router, disableTouchOptimization]
  );

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      // Si onPointerDown a déjà été appelé récemment, ignorer le click
      if (
        !disableTouchOptimization &&
        touchStartTimeRef.current &&
        Date.now() - touchStartTimeRef.current < 300
      ) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Pour les clics souris normaux, appeler onClick si fourni
      onClick?.();
    },
    [onClick, disableTouchOptimization]
  );

  return (
    <Link
      href={href}
      className={clsx('select-none', className)}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      prefetch={prefetch}
      style={{ touchAction: 'manipulation' }}
      {...props}
    >
      {children}
    </Link>
  );
}

