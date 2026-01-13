import { TouchLink } from '@/app/components/TouchLink';
import { ChevronIcon } from './icons';
import { Button } from './Button';

type Props = {
  href: string;
  label: string;
  emoji?: string;
};

/**
 * Bouton de navigation réutilisable pour "Voir tout"
 * Style cohérent avec les autres boutons de navigation
 */
export function ViewAllLink({ href, label, emoji = '📜' }: Props) {
  return (
    <TouchLink href={href} className="mt-4 block">
      <Button
        variant="secondary"
        size="md"
        rounded="lg"
        className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700"
      >
        <span>{emoji} {label}</span>
        <ChevronIcon direction="right" className="w-4 h-4" />
      </Button>
    </TouchLink>
  );
}

