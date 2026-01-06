import Link from 'next/link';
import clsx from 'clsx';
import type { ExerciceCategory } from '@/app/types/exercice';
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS, CATEGORY_HREFS } from '@/app/constants/exercice.constants';

type Props = {
  category: ExerciceCategory;
  /** Nombre total d'exercices dans cette catégorie */
  total: number;
  /** Nombre d'exercices complétés dans la période */
  completedCount: number;
};

/**
 * Carte de catégorie avec jauge de progression intégrée
 * Style harmonisé avec MenuLink + ring coloré + jauge
 * Design optimisé pour les personnes post-AVC :
 * - Grande zone de clic
 * - Icône visuelle claire
 * - Progression visible directement
 */
export function CategoryCardWithProgress({ 
  category, 
  total, 
  completedCount 
}: Props) {
  const styles = CATEGORY_COLORS[category];
  const icon = CATEGORY_ICONS[category];
  const label = CATEGORY_LABELS[category];
  const href = CATEGORY_HREFS[category];

  // Calculer le pourcentage de progression (max 100%)
  const percentage = total > 0 ? Math.min((completedCount / total) * 100, 100) : 0;
  const hasProgress = completedCount > 0;
  const isComplete = completedCount >= total;
  const hasBonus = completedCount > total;

  return (
    <Link 
      href={href}
      aria-label={`${label} - ${Math.min(completedCount, total)} sur ${total} exercices complétés${hasBonus ? `, ${completedCount - total} exercices bonus` : ''}`}
      aria-describedby={`progress-${category}`}
      className={clsx(
        'group block border-2 rounded-xl transition-all duration-200',
        'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        styles.bg,
        styles.cardBorder,
        styles.focusRing
      )}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Icône */}
          <div className={clsx(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
            'shadow-md group-hover:shadow-lg group-hover:scale-110',
            'transition-all duration-200',
            styles.iconBg
          )}>
            <span 
              className={clsx(
                'text-2xl flex items-center justify-center',
                'transition-transform duration-200 group-hover:scale-110',
                styles.iconText
              )}
              role="img" 
              aria-label={`Icône ${label}`}
            >
              {icon}
            </span>
          </div>
          
          {/* Textes */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-gray-950 transition-colors truncate">
              {label}
            </h3>
            <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
              {total} exercice{total > 1 ? 's' : ''}
            </p>
          </div>

          {/* Badge de progression */}
          <div className={clsx(
            'shrink-0 px-2.5 py-1 rounded-full font-bold text-xs flex items-center gap-1',
            hasProgress ? `${styles.accent} text-white` : 'bg-gray-200 text-gray-500'
          )}>
            {isComplete ? (
              <>
                <span>✓</span>
                <span>{total}/{total}</span>
                {hasBonus && <span className="text-[10px] opacity-75">+{completedCount - total}</span>}
              </>
            ) : (
              <span>{completedCount}/{total}</span>
            )}
          </div>
        </div>

        {/* Jauge de progression */}
        <div className="mt-3">
          <div 
            className="h-1.5 bg-white/60 rounded-full overflow-hidden" 
            role="progressbar" 
            aria-valuenow={Math.min(completedCount, total)} 
            aria-valuemin={0} 
            aria-valuemax={total} 
            aria-label={`Progression : ${Math.min(completedCount, total)} sur ${total} exercices complétés${hasBonus ? ` (+${completedCount - total} bonus)` : ''}`} 
            id={`progress-${category}`}
          >
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500 ease-out',
                styles.accent
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

