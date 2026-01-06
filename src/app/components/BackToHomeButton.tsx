import Link from 'next/link';
import { ChevronIcon } from '@/app/components/ui/icons';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';

export default function BackToHomeButton() {
  return (
    <div className=" mb-2">
      <Link 
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
        aria-label="Retour à l'accueil"
      >
        <ChevronIcon direction="left" className="w-5 h-5" />
        <span>{NAVIGATION_EMOJIS.HOME} Retour</span>
      </Link>
    </div>
  );
}

