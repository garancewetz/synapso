'use client';

import { useMemo } from 'react';
import clsx from 'clsx';
import {
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  CATEGORY_HREFS,
  BODYPART_ICONS,
  getBodypartsByCategory,
} from '@/app/constants/exercice.constants';
import { TouchLink } from '@/app/components/TouchLink';
import { Card } from '@/app/components/ui/Card';
import { useLayoutContext } from '@/app/contexts/LayoutContext';

export function CategoriesPageClient() {
  const { preserveDate } = useLayoutContext();
  const bodypartsByCategory = useMemo(() => getBodypartsByCategory(), []);

  return (
    <section className="pb-12 md:pb-8" aria-labelledby="categories-heading">
      <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto pt-2 md:pt-4 px-4 md:px-6 lg:px-8">
        <h1 id="categories-heading" className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
          Catégories et parties du corps
        </h1>
        <p className="text-gray-500 mb-6">
          Chaque catégorie regroupe des parties du corps. Cliquez sur une catégorie pour voir ses exercices.
        </p>

        <ul className="space-y-4 list-none p-0 m-0">
          {CATEGORY_ORDER.map((category) => {
            const styles = CATEGORY_COLORS[category];
            const bodyparts = bodypartsByCategory[category];
            const href = preserveDate(CATEGORY_HREFS[category]);

            return (
              <li key={category}>
                <TouchLink
                  href={href}
                  aria-label={`${CATEGORY_LABELS[category]} – voir les exercices`}
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
                    <div className="flex items-start gap-3">
                      <div
                        className={clsx(
                          'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md',
                          styles.iconBg
                        )}
                      >
                        <span
                          className={clsx('text-2xl', styles.iconText)}
                          role="img"
                          aria-hidden
                        >
                          {CATEGORY_ICONS[category]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base font-semibold text-gray-900">
                          {CATEGORY_LABELS[category]}
                        </h2>
                        {bodyparts.length > 0 ? (
                          <ul className="mt-2 flex flex-wrap gap-1.5 list-none p-0 m-0" aria-label="Parties du corps">
                            {bodyparts.map((bp) => (
                              <li key={bp}>
                                <span
                                  className={clsx(
                                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                                    styles.tag
                                  )}
                                >
                                  <span aria-hidden>{BODYPART_ICONS[bp] ?? '•'}</span>
                                  {bp}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">Aucune partie du corps associée</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </TouchLink>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
