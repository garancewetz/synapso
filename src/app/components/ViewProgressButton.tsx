import Link from 'next/link';
import { MapIcon } from '@/app/components/ui/icons';

/**
 * Bouton "Mon parcours" - Composant réutilisable
 * Style doré avec dégradé ambre pour encourager la consultation du parcours
 */
export default function ViewProgressButton() {
  return (
    <div className="flex justify-center mt-8">
      <Link
        href="/historique"
        className="max-w-md py-4 px-6 rounded-full font-bold text-amber-950 
                   bg-linear-to-r from-amber-300 via-yellow-400 to-amber-500 
                   shadow-[0_4px_10px_rgba(217,119,6,0.3)] 
                   hover:scale-[1.02] hover:shadow-[0_6px_14px_rgba(217,119,6,0.4)]
                   transition-all flex items-center justify-center gap-2"
      >
        <MapIcon className="w-5 h-5" />
        Mon parcours
      </Link>
    </div>
  );
}

