type Props = {
  /** Nombre de jours à afficher (par défaut 40 pour la roadmap complète) */
  daysCount?: number;
};

/**
 * Skeleton pour ActivityHeatmap
 * Affiche une grille de carrés pendant le chargement
 */
export function ActivityHeatmapSkeleton({ daysCount = 40 }: Props) {
  // Créer les carrés pour représenter les jours
  const days = Array.from({ length: daysCount }, (_, i) => i);
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Barre de progression skeleton */}
      <div className="mb-5">
        <div className="flex justify-between text-sm mb-2">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full">
          <div className="h-full bg-gray-200 rounded-full w-1/3 animate-pulse" />
        </div>
      </div>

      {/* Grille de carrés skeleton */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day}
            className="aspect-square bg-gray-100 rounded animate-pulse"
          />
        ))}
      </div>

      {/* Légende skeleton */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

