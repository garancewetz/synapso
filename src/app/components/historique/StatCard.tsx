interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  unit?: string;
  colorScheme: 'purple' | 'blue' | 'emerald' | 'amber';
  badge?: {
    threshold: number;
    text: string;
  }[];
}

const colorSchemes = {
  purple: {
    bg: 'from-purple-50 to-indigo-50',
    border: 'border-purple-100',
    labelColor: 'text-purple-600',
    valueColor: 'text-purple-700',
    badgeColor: 'text-purple-500',
  },
  blue: {
    bg: 'from-blue-50 to-cyan-50',
    border: 'border-blue-100',
    labelColor: 'text-blue-600',
    valueColor: 'text-blue-600',
    badgeColor: 'text-blue-500',
  },
  emerald: {
    bg: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-100',
    labelColor: 'text-emerald-600',
    valueColor: 'text-emerald-600',
    badgeColor: 'text-emerald-500',
  },
  amber: {
    bg: 'from-amber-50 to-orange-50',
    border: 'border-amber-100',
    labelColor: 'text-amber-600',
    valueColor: 'text-amber-500',
    badgeColor: 'text-amber-500',
  },
};

export function StatCard({ icon, label, value, unit, colorScheme, badge }: StatCardProps) {
  const colors = colorSchemes[colorScheme];
  
  // Trouver le badge applicable (le premier dont le seuil est atteint)
  const applicableBadge = badge?.find(b => value >= b.threshold);

  return (
    <div className={`bg-gradient-to-br ${colors.bg} p-4 sm:p-6 rounded-2xl border ${colors.border} shadow-sm`}>
      <h3 className={`text-xs sm:text-sm font-medium ${colors.labelColor} mb-1 flex items-center gap-1`}>
        <span>{icon}</span> {label}
      </h3>
      <p className={`text-2xl sm:text-4xl font-bold ${colors.valueColor}`}>
        {value}{unit && ` ${unit}`}
      </p>
      {applicableBadge && (
        <span className={`text-xs ${colors.badgeColor}`}>{applicableBadge.text}</span>
      )}
    </div>
  );
}

