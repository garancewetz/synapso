type Props = {
  value: number | string;
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
};

/**
 * Composant de carte de statistique carrée
 * Affiche une valeur en grand et un label en petit
 */
export function StatsCard({ value, label, bgColor, textColor, borderColor }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${bgColor} rounded-lg border ${borderColor} p-3 min-h-[90px]`}>
      <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
      <div className={`text-[10px] font-semibold ${textColor} mt-1`}>{label}</div>
    </div>
  );
}

