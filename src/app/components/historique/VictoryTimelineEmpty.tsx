/**
 * État vide pour la timeline des victoires
 * Server Component - pas d'interactivité nécessaire
 */
export function VictoryTimelineEmpty() {
  return (
    <div className="bg-amber-50 rounded-2xl border-2 border-amber-300 p-8 text-center">
      <span className="text-4xl mb-3 block">🌱</span>
      <p className="text-amber-950 font-medium">Aucune victoire notée pour l&apos;instant</p>
      <p className="text-amber-700 text-sm mt-1">
        Tes réussites apparaîtront ici !
      </p>
    </div>
  );
}

