/**
 * État vide pour la timeline des progrès
 * Server Component - pas d'interactivité nécessaire
 */
export function ProgressTimelineEmpty() {
  return (
    <div className="bg-amber-50 rounded-2xl border-2 border-amber-300 p-8 text-center">
      <span className="text-4xl mb-3 block">🌱</span>
      <p className="text-amber-950 font-medium">Aucun progrès noté pour l&apos;instant</p>
      <p className="text-amber-700 text-sm mt-1">
        Tes progrès apparaîtront ici !
      </p>
    </div>
  );
}

