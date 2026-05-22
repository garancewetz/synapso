import { Card } from '@/app/components/ui/Card';

// Placeholder visuel pour une CategoryCardWithProgress en cours de chargement.
// Partagé entre HomeExercicesTab (loading state) et HomeExercicesSkeleton (Suspense fallback).
export function CategoryCardPlaceholder() {
  return (
    <Card variant="default" padding="md">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="w-12 h-5 rounded-full bg-gray-200 animate-pulse shrink-0" />
      </div>
      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </Card>
  );
}
