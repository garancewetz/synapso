import Link from 'next/link';
import { ChevronIcon } from './icons';

type Props = {
  href: string;
  label: string;
  emoji?: string;
};

/**
 * Bouton de navigation réutilisable pour "Voir tout"
 * Style cohérent avec les autres boutons de navigation
 */
export default function ViewAllLink({ href, label, emoji = '📜' }: Props) {
  return (
    <Link 
      href={href}
      className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 font-medium transition-colors cursor-pointer"
    >
      <span>{emoji} {label}</span>
      <ChevronIcon direction="right" className="w-4 h-4" />
    </Link>
  );
}

