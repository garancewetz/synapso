'use client';

import { memo, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { CategoryCardWithProgress } from '@/app/features/exercices';
import { MenuLink } from '@/app/components';
import { Card } from '@/app/components/ui/Card';
import { useLayoutContext } from '@/app/contexts/LayoutContext';
import { CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import { SITEMAP_ICON_STYLES } from '@/app/constants/sitemap.constants';
import type { Exercice } from '@/app/types/exercice';
import type { ExerciceCategory } from '@/app/types/exercice';

const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  { ssr: false }
);

function CategoryCardPlaceholder() {
  return (
    <Card variant="default" padding="md">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="w-12 h-5 rounded-full bg-gray-200 animate-pulse shrink-0" />
      </div>
      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </Card>
  );
}

type Props = {
  exercices: Exercice[];
  relatedStretchingByCategory: Record<ExerciceCategory, number>;
  archivedCount: number;
  error?: Error | null;
  loading?: boolean;
};

export const HomeExercicesTab = memo(function HomeExercicesTab({
  exercices,
  relatedStretchingByCategory,
  archivedCount,
  error,
  loading = false,
}: Props) {
  const { navMenuType } = useLayoutContext();
  const activeExercices = useMemo(() => exercices.filter(e => !e.archived), [exercices]);

  const exercicesByCategory = useMemo(() => {
    const map = new Map<ExerciceCategory, Exercice[]>();
    CATEGORY_ORDER.forEach(category => {
      map.set(category, activeExercices.filter(e => e.category === category));
    });
    return map;
  }, [activeExercices]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Impossible de charger les exercices. Tirez vers le bas pour réessayer.
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {loading ? (
          CATEGORY_ORDER.map((category) => (
            <CategoryCardPlaceholder key={category} />
          ))
        ) : CATEGORY_ORDER.filter(category => (exercicesByCategory.get(category) || []).length > 0).map((category, index) => {
          const categoryExercices = exercicesByCategory.get(category) || [];

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
                relatedStretchingCount={relatedStretchingByCategory[category]}
              />
            </MotionDiv>
          );
        })}
      </div>
      <MenuLink
        title="Vue par équipement"
        icon="🏋️"
        description="Filtrer les exercices par équipement"
        href="/exercices/all"
        iconBgColor={SITEMAP_ICON_STYLES.default.bg}
        iconTextColor={SITEMAP_ICON_STYLES.default.text}
        isSecondary={true}
      />
      {navMenuType !== 'slide' && (
        <MenuLink
          title="Ajouter un exercice"
          icon="➕"
          href="/exercice/add"
          iconBgColor={SITEMAP_ICON_STYLES.default.bg}
          iconTextColor={SITEMAP_ICON_STYLES.default.text}
          isSecondary={true}
        />
      )}
      <MenuLink
        title="Exercices archivés"
        icon="📦"
        description={`${archivedCount} exercice${archivedCount > 1 ? 's' : ''} archivé${archivedCount > 1 ? 's' : ''}`}
        href="/exercices/archived"
        iconBgColor={SITEMAP_ICON_STYLES.default.bg}
        iconTextColor={SITEMAP_ICON_STYLES.default.text}
        isSecondary={true}
      />
    </div>
  );
});
