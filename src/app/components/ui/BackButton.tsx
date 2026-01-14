'use client';

import { useRouter } from 'next/navigation';
import { ChevronIcon } from '@/app/components/ui/icons';
import { LinkButton } from '@/app/components/ui/LinkButton';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { getCurrentPageName } from '@/app/utils/navigation.utils';
import clsx from 'clsx';

type Props = {
  backHref?: string;
  backLabel?: string;
  className?: string;
  buttonClassName?: string;
};

export function BackButton({ 
  backHref, 
  backLabel, 
  className,
  buttonClassName,
}: Props) {
  const router = useRouter();

  // Calculer le label à afficher
  let label = backLabel;
  if (!label) {
    if (backHref) {
      const pageName = getCurrentPageName(backHref);
      if (pageName) {
        label = `Retour à ${pageName.toLowerCase()}`;
      } else if (backHref === '/') {
        label = `${NAVIGATION_EMOJIS.HOME} Retour à l'accueil`;
      } else {
        label = `${NAVIGATION_EMOJIS.HOME} Retour à l'accueil`;
      }
    } else {
      label = `${NAVIGATION_EMOJIS.HOME} Retour à l'accueil`;
    }
  }

  // Navigation par défaut vers l'accueil si pas de href
  const href = backHref || '/';

  const handleBack = () => {
    router.push(href);
  };

  const wrapperClasses = clsx(
    'px-3 sm:px-6',
    className
  );

  // Contenu commun du bouton
  const buttonContent = (
    <>
      <ChevronIcon className="w-6 h-6 text-gray-700" direction="left" />
      <span>{label}</span>
    </>
  );

  return (
    <div className={wrapperClasses}>
      {backHref ? (
        <LinkButton
          href={backHref}
          variant="secondary"
          size="md"
          rounded="lg"
          className={clsx(
            'gap-3',
            'bg-white border-2 border-gray-200',
            'text-base font-semibold text-gray-800',
            'hover:border-gray-300 hover:bg-gray-50',
            'active:scale-[0.98]',
            buttonClassName
          )}
          aria-label={label}
        >
          {buttonContent}
        </LinkButton>
      ) : (
        <button
          onClick={handleBack}
          className={clsx(
            'inline-flex items-center gap-3',
            'rounded-lg',
            'bg-white border-2 border-gray-200',
            'text-base font-semibold text-gray-800',
            'hover:border-gray-300 hover:bg-gray-50',
            'transition-all duration-200',
            'active:scale-[0.98]',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400',
            'px-4 py-2',
            'cursor-pointer',
            buttonClassName
          )}
          aria-label={label}
        >
          {buttonContent}
        </button>
      )}
    </div>
  );
}

