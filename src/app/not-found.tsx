import { TouchLink } from '@/app/components/TouchLink';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { Button } from '@/app/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icône principale */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-5xl" role="img" aria-hidden="true">🔍</span>
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Page introuvable
        </h1>

        {/* Message explicatif */}
        <p className="text-lg text-gray-600 mb-2">
          Désolé, cette page n&apos;existe pas ou a été déplacée.
        </p>
        <p className="text-base text-gray-500 mb-8">
          Ne vous inquiétez pas, vous pouvez facilement retrouver votre chemin !
        </p>

        {/* Bouton d'action */}
        <div className="space-y-3">
          <TouchLink href="/">
            <Button
              variant="primary"
              size="lg"
              rounded="lg"
              className="w-full shadow-md"
            >
              <span className="text-2xl" role="img" aria-hidden="true">{NAVIGATION_EMOJIS.HOME}</span>
              <span>Retour à l&apos;accueil</span>
            </Button>
          </TouchLink>
        </div>
      </div>
    </div>
  );
}

