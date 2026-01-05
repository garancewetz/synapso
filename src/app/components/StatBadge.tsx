type Props = {
  value: number;
  label: string;
  bgColorClass: string;
  textColorClass: string;
  textColorDarkClass: string;
  emoji?: string;
};

/**
 * Badge de statistique affichant une valeur avec un label
 * Utilisé pour afficher des statistiques comme "5 victoires", "3 ortho", etc.
 */
export function StatBadge({ value, label, bgColorClass, textColorClass, textColorDarkClass, emoji }: Props) {
  return (
    <div className={`${bgColorClass} rounded-xl p-3 md:p-4 text-center`}>
      <p className={`text-xl md:text-2xl font-bold ${textColorClass}`}>
        {value}
      </p>
      <p className={`text-[10px] md:text-xs ${textColorDarkClass}`}>
        {emoji && <span className="mr-1">{emoji}</span>}
        {label}
      </p>
    </div>
  );
}

