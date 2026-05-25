// Skeleton générique du shell de l'app — affiché en fallback du Suspense layout
// pendant la résolution de l'auth SSR. Volontairement neutre (pas de contenu
// route-spécifique) pour rester correct quelle que soit la page demandée. Les
// skeletons spécifiques (WelcomeHeaderSkeleton, HomeExercicesSkeleton, etc.)
// prennent ensuite le relais via les Suspense internes de chaque route.
// Aucune dépendance à UserContext / features (le fallback rend avant l'hydratation).
function NavBarSkeleton() {
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="max-w-10xl mx-auto px-3 md:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

function BottomNavBarSkeleton() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200">
      <div className="grid grid-cols-5 h-16">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            <div className="h-7 w-7 bg-gray-100 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AppShellSkeleton() {
  return (
    <div aria-hidden="true" className="min-h-screen bg-[#F8FAFB]">
      <NavBarSkeleton />
      <main className="flex-1 mx-auto w-full max-w-10xl pb-28 md:pb-8" />
      <BottomNavBarSkeleton />
    </div>
  );
}
