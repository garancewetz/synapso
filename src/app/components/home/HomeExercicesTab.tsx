import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { CategoryCardWithProgress, MenuLink } from '@/app/components';
import { CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import { SITEMAP_ICON_STYLES } from '@/app/constants/sitemap.constants';
import type { Exercice } from '@/app/types/exercice';
import type { ExerciceCategory } from '@/app/types/exercice';

const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  { ssr: false }
);

type Props = {
  exercices: Exercice[];
  categoryStats: Record<ExerciceCategory, number>;
  relatedStretchingByCategory: Record<ExerciceCategory, number>;
  loadingStats: boolean;
};

export function HomeExercicesTab({
  exercices,
  categoryStats,
  relatedStretchingByCategory,
  loadingStats,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {CATEGORY_ORDER.map((category, index) => {
          const categoryExercices = exercices.filter(e => e.category === category);

          return (
            <MotionDiv
              key={category}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15, delay: index * 0.03 }}
            >
              <CategoryCardWithProgress
                category={category}
                total={categoryExercices.length}
                completedCount={loadingStats ? 0 : categoryStats[category]}
                relatedStretchingCount={relatedStretchingByCategory[category]}
              />
            </MotionDiv>
          );
        })}
      </div>
      <MenuLink
        title="Vue globale"
        icon="🔍"
        description="Tous les exercices et étirements avec filtres"
        href="/exercices/all"
        iconBgColor={SITEMAP_ICON_STYLES.default.bg}
        iconTextColor={SITEMAP_ICON_STYLES.default.text}
        isSecondary={true}
      />
    </div>
  );
}
