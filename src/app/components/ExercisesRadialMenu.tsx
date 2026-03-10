'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  CATEGORY_HREFS,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  CATEGORY_LABELS_SHORT,
  CATEGORY_COLORS,
} from '@/app/constants/exercice.constants';
import { useLayoutContext } from '@/app/contexts/LayoutContext';

function triggerHaptic(durationMs = 10) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(durationMs);
  }
}

const BOTTOM_NAV_HEIGHT = 56;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function ExercisesRadialMenu({ isOpen }: Props) {
  const pathname = usePathname();
  const { preserveDate, radialCategories } = useLayoutContext();

  return (
    <AnimatePresence>
      {isOpen && radialCategories.length > 0 && (
        <motion.div
          key="categories-row"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="fixed left-0 right-0 z-70 px-4 pb-2 md:hidden"
          style={{ bottom: BOTTOM_NAV_HEIGHT }}
          aria-hidden
        >
          <div className="flex flex-row items-center justify-center gap-3 overflow-x-auto py-2">
            {radialCategories.map((category, index) => {
              const href = preserveDate(CATEGORY_HREFS[category]);
              const categoryPath = CATEGORY_HREFS[category];
              const isActive = pathname === categoryPath;
              const styles = CATEGORY_COLORS[category];
              const label = CATEGORY_LABELS[category];
              const icon = CATEGORY_ICONS[category];
              const displayLabel = CATEGORY_LABELS_SHORT[category];
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 28,
                    delay: index * 0.03,
                  }}
                  className="shrink-0"
                >
                  <Link
                    href={href}
                    aria-label={label}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => triggerHaptic(12)}
                    className={clsx(
                      'flex flex-col items-center justify-center rounded-full w-14 h-14 min-h-[56px] min-w-[56px]',
                      'shadow-lg ring-4 ring-white',
                      'active:scale-95 transition-all py-1.5 px-1.5',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900',
                      isActive && 'ring-2 ring-offset-2 ring-offset-white',
                      isActive && styles.ring,
                      styles.iconBg
                    )}
                  >
                    <span
                      className={clsx('text-xl flex items-center justify-center leading-none', styles.iconText)}
                      role="img"
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                    <span
                      className={clsx(
                        'text-[10px] font-bold text-center leading-tight mt-0.5 px-0.5',
                        'drop-shadow-[0_0_1px_rgba(255,255,255,0.9)]',
                        styles.iconText
                      )}
                    >
                      {displayLabel}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
