/**
 * Skeleton pour ActivityLineChart
 * Affiche une structure similaire au graphique pendant le chargement
 */
export function ActivityLineChartSkeleton() {
  const chartWidth = 900;
  const chartHeight = 260;
  const padding = { top: 30, right: 40, bottom: 50, left: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto"
        aria-label="Chargement du graphique"
        role="img"
      >
        {/* Axe Y skeleton */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={chartHeight - padding.bottom}
          stroke="#E5E7EB"
          strokeWidth="2"
          className="animate-pulse"
        />
        
        {/* Axe X skeleton */}
        <line
          x1={padding.left}
          y1={chartHeight - padding.bottom}
          x2={chartWidth - padding.right}
          y2={chartHeight - padding.bottom}
          stroke="#E5E7EB"
          strokeWidth="2"
          className="animate-pulse"
        />
        
        {/* Ligne skeleton (courbe) */}
        <path
          d={`M ${padding.left} ${chartHeight - padding.bottom - innerHeight / 2} 
              Q ${padding.left + innerWidth / 3} ${padding.top + 20}, 
                ${padding.left + innerWidth / 2} ${padding.top + 40}
              T ${chartWidth - padding.right} ${chartHeight - padding.bottom - innerHeight / 3}`}
          fill="none"
          stroke="#D1D5DB"
          strokeWidth="3"
          strokeDasharray="4 4"
          className="animate-pulse"
        />
        
        {/* Points skeleton */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const x = padding.left + innerWidth * ratio;
          const y = padding.top + innerHeight / 2 + (i % 2 === 0 ? -20 : 20);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="6"
              fill="#E5E7EB"
              className="animate-pulse"
            />
          );
        })}
        
        {/* Labels axe X skeleton */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const x = padding.left + innerWidth * ratio;
          return (
            <rect
              key={i}
              x={x - 15}
              y={chartHeight - padding.bottom + 10}
              width="30"
              height="12"
              fill="#E5E7EB"
              rx="2"
              className="animate-pulse"
            />
          );
        })}
      </svg>
    </div>
  );
}

