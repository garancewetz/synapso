import { Button } from './Button';
import { ChevronIcon } from './icons';

type Props = {
  href: string;
  label: string;
  emoji?: string;
};

/**
 * Lien de navigation réutilisable pour "Voir tout"
 * Style cohérent avec les autres boutons de navigation
 * 
 * Utilise Button pour un lien stylé comme un bouton (sémantiquement correct, mobile-first)
 */
export function ViewAllLink({ href, label, emoji = '📋' }: Props) {
  return (
    <div className="mt-4">
      <Button
        href={href}
        variant="secondary"
        size="md"
        rounded="lg"
        className="w-full flex items-center justify-center gap-2"
      >
        <span>{emoji} {label}</span>
        <ChevronIcon direction="right" className="w-4 h-4" />
      </Button>
    </div>
  );
}

