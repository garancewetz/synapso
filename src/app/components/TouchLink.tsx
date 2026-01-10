import Link from 'next/link';
import { forwardRef } from 'react';
import type { ReactNode, ComponentPropsWithoutRef } from 'react';
import clsx from 'clsx';

type Props = Omit<ComponentPropsWithoutRef<typeof Link>, 'href' | 'prefetch'> & {
  href: string;
  children: ReactNode;
  className?: string;
  /** Précharger la route au survol (desktop) */
  prefetch?: boolean;
};

/**
 * Composant Link optimisé pour les interactions tactiles sur mobile
 * Utilise touch-action: manipulation pour éviter le délai de 300ms
 * et le double-tap zoom sur les navigateurs mobiles
 */
export const TouchLink = forwardRef<HTMLAnchorElement, Props>(function TouchLink(
  { href, children, className, prefetch = true, ...props },
  ref
) {
  return (
    <Link
      ref={ref}
      href={href}
      className={clsx('select-none cursor-pointer', className)}
      prefetch={prefetch}
      style={{ touchAction: 'manipulation' }}
      {...props}
    >
      {children}
    </Link>
  );
});

