// Skeleton calqué sur WelcomeHeader pour éviter le layout shift quand la donnée arrive.
export function WelcomeHeaderSkeleton() {
  return (
    <div
      className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 md:px-6 lg:px-8 pt-2 md:pt-4"
      aria-hidden="true"
    >
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 py-5 md:p-6 mb-6 overflow-hidden">
        {/* Greeting */}
        <div className="px-4 md:px-0">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mt-2" />
        </div>
        {/* Daily goal progress */}
        <div className="mt-4 px-4 md:px-0">
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-1/5 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
        {/* WeekCalendar : 7 jours */}
        <div className="mt-4 px-2 md:px-0 grid grid-cols-7 gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
