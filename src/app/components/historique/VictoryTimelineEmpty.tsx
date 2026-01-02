/**
 * État vide pour la timeline des victoires
 * Server Component - pas d'interactivité nécessaire
 */
export function VictoryTimelineEmpty() {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 shadow-sm p-8 text-center">
      <span className="text-4xl mb-3 block">🌱</span>
      <p className="text-amber-800 font-medium">Aucune victoire notée pour l&apos;instant</p>
      <p className="text-amber-600 text-sm mt-1">
        Tes réussites apparaîtront ici !
      </p>
    </div>
  );
}

