'use client';

import clsx from 'clsx';
import type { ExerciceCategory } from '@/app/types/exercice';
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS, CATEGORY_HREFS } from '@/app/constants/exercice.constants';
import { TouchLink } from '@/app/components/TouchLink';
import { Card } from '@/app/components/ui/Card';
import { usePreserveDateParam } from '@/app/hooks/usePreserveDateParam';
import { useCategoryStats } from '../hooks/useCategoryStats';

type Props = {
  category: ExerciceCategory;
  /** Nombre total d'exercices dans cette catégorie */
  total: number;
  /** Nombre d'étirements liés à cette catégorie */
  relatedStretchingCount?: number;
};

/**
 * Carte de catégorie avec jauge de progression intégrée
 * Style harmonisé avec MenuLink + ring coloré + jauge
 * Design optimisé pour les personnes post-AVC :
 * - Grande zone de clic
 * - Icône visuelle claire
 * - Progression visible directement
 * 
 * ⚡ FIX: Utilise useCategoryStats directement pour récupérer les stats de la catégorie
 * Cela garantit que les gauges se mettent à jour correctement en mode sablier
 */
export function CategoryCardWithProgress({ 
  category, 
  total, 
  relatedStretchingCount = 0
}: Props) {
  const preserveDate = usePreserveDateParam();
  const styles = CATEGORY_COLORS[category];
  const icon = CATEGORY_ICONS[category];
  const label = CATEGORY_LABELS[category];
  const href = CATEGORY_HREFS[category];
  
  // ⚡ FIX: Utiliser useCategoryStats directement pour récupérer les stats de cette catégorie
  // Cela garantit que les gauges se mettent à jour correctement en mode sablier
  const { stats, loading: loadingStats, error: statsError } = useCategoryStats();
  const isLoading = loadingStats && !statsError;
  const completedCount = isLoading ? null : (statsError ? 0 : stats[category]);

  const safeCount = completedCount ?? 0;
  const percentage = total > 0 ? Math.min((safeCount / total) * 100, 100) : 0;
  const hasProgress = safeCount > 0;
  const isComplete = safeCount >= total;
  const hasBonus = safeCount > total;
  
  // Texte adapté selon la catégorie
  const itemLabel = category === 'STRETCHING' ? 'étirement' : 'exercice';
  const itemLabelPlural = category === 'STRETCHING' ? 'étirements' : 'exercices';

  return (
    <TouchLink 
      href={preserveDate(href)}
      aria-label={`${label} - ${Math.min(safeCount, total)} sur ${total} ${itemLabelPlural} complétés${hasBonus ? `, ${safeCount - total} ${itemLabelPlural} bonus` : ''}`}
      aria-describedby={`progress-${category}`}
      className="block group"
    >
      <Card
        variant="default"
        padding="md"
        bgColor={styles.bg}
        className={clsx(
          'transition-all duration-200 cursor-pointer',
          'md:hover:ring-2 md:hover:ring-gray-300/50 md:hover:ring-offset-2 active:scale-[0.98]',
          'focus-within:ring-2 focus-within:ring-offset-2',
          styles.cardBorder,
          styles.focusRing
        )}
      >
        <div className="flex items-center gap-3">
          {/* Icône */}
          <div className={clsx(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
            'shadow-md transition-all duration-200',
            styles.iconBg
          )}>
            <span 
              className={clsx(
                'text-2xl flex items-center justify-center',
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
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {label}
            </h3>
            <p className="text-xs text-gray-500">
              {total} {itemLabel}{total > 1 ? 's' : ''}
              {relatedStretchingCount > 0 && (
                <span className="ml-1.5 text-gray-400">
                  + {relatedStretchingCount} étirement{relatedStretchingCount > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>

          {/* Badge de progression */}
          <div className={clsx(
            'shrink-0 px-2.5 py-1 rounded-full font-bold text-xs flex items-center gap-1',
            completedCount === null
              ? 'bg-gray-200 animate-pulse'
              : hasProgress ? `${styles.accent} text-white` : 'bg-gray-200 text-gray-500'
          )}>
            {completedCount === null ? (
              <span className="w-6 h-3" />
            ) : isComplete ? (
              <>
                <span>✓</span>
                <span>{total}/{total}</span>
                {hasBonus && <span className="text-[10px] opacity-75">+{safeCount - total}</span>}
              </>
            ) : (
              <span>{safeCount}/{total}</span>
            )}
          </div>
        </div>

        {/* Jauge de progression */}
        <div className="mt-3">
          <div 
            className="h-1.5 bg-white/60 rounded-full overflow-hidden" 
            role="progressbar" 
            aria-valuenow={Math.min(safeCount, total)}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label={`Progression : ${Math.min(safeCount, total)} sur ${total} ${itemLabelPlural} complétés${hasBonus ? ` (+${safeCount - total} bonus)` : ''}`}
            id={`progress-${category}`}
          >
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500 ease-out',
                completedCount === null ? 'animate-pulse bg-gray-300' : styles.accent
              )}
              style={{ width: completedCount === null ? '30%' : `${percentage}%` }}
            />
          </div>
        </div>
      </Card>
    </TouchLink>
  );
}

