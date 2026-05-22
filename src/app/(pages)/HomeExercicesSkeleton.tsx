import { Card } from '@/app/components/ui/Card';
import { CATEGORY_ORDER } from '@/app/constants/exercice.constants';
// Import direct (pas via le barrel) car ce fichier est utilisé comme Suspense
// fallback côté server → le barrel embarquerait des composants client.
import { CategoryCardPlaceholder } from '@/app/features/exercices/components/CategoryCardPlaceholder';

function MenuLinkPlaceholder() {
  return (
    <Card variant="default" padding="md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    </Card>
  );
}

export function HomeExercicesSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {CATEGORY_ORDER.map(category => (
          <CategoryCardPlaceholder key={category} />
        ))}
      </div>
      <MenuLinkPlaceholder />
      <MenuLinkPlaceholder />
    </div>
  );
}
