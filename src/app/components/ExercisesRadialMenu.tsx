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

const RADIUS = 88;
const BUBBLE_HEIGHT = 52;
const HITBOX_PADDING = 8;
const HITBOX_SIZE = BUBBLE_HEIGHT + HITBOX_PADDING * 2;

const HORIZONTAL_COMPRESSION = 0.8;

function getBubblePosition(index: number, count: number) {
  if (count <= 1) {
    return { x: 0, y: -RADIUS * 0.5 };
  }
  // Arc légèrement au‑delà de 180° pour un effet enveloppant,
  // mais compressé horizontalement pour que les extrémités
  // tombent mieux entre les 3 boutons de la barre du bas.
  const startAngle = 195; // gauche
  const endAngle = -15;   // droite
  const angleStep = (startAngle - endAngle) / (count - 1);
  const angleDeg = startAngle - index * angleStep;
  const angleRad = (angleDeg * Math.PI) / 180;
  const x = RADIUS * Math.cos(angleRad) * HORIZONTAL_COMPRESSION;
  const y = -RADIUS * Math.sin(angleRad);
  return { x, y };
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const CONTAINER_HEIGHT = RADIUS + BUBBLE_HEIGHT;
const EXTENSION_BELOW = 48;
const SVG_HEIGHT = CONTAINER_HEIGHT + EXTENSION_BELOW;

export function ExercisesRadialMenu({ isOpen }: Props) {
  const pathname = usePathname();
  const { preserveDate, radialCategories } = useLayoutContext();

  return (
    <AnimatePresence>
      {isOpen && radialCategories.length > 0 && (
        <>
          <motion.div
            key="radial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-0 bottom-2 z-70 pointer-events-none md:hidden"
            aria-hidden
          >
            <div
              className="relative mx-auto flex items-end justify-center pointer-events-none"
              style={{ width: RADIUS * 2, height: SVG_HEIGHT }}
            >
              {radialCategories.map((category, index) => {
                const count = radialCategories.length;
                const { x, y } = getBubblePosition(index, count);
                const isEdge = index === 0 || index === count - 1;
                const isMiddle = index >= 1 && index <= Math.min(3, count - 2);
                const adjustedY = isEdge ? y - 8 : isMiddle ? y + 12 : y;
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
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 28,
                      delay: index * 0.04,
                    }}
                    style={{
                      position: 'absolute',
                      left: RADIUS + x - HITBOX_SIZE / 2,
                      bottom: BUBBLE_HEIGHT - adjustedY - HITBOX_SIZE / 2,
                      width: HITBOX_SIZE,
                      height: HITBOX_SIZE,
                      transformOrigin: 'center center',
                    }}
                    className="flex flex-col items-center justify-center pointer-events-auto"
                  >
                    <Link
                      href={href}
                      aria-label={label}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => triggerHaptic(12)}
                      className={clsx(
                        'flex flex-col items-center justify-center shrink-0 rounded-lg min-h-[44px] min-w-[44px]',
                        'shadow-md ring-4 ring-white',
                        'active:scale-95 transition-all py-1 px-1.5',
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
        </>
      )}
    </AnimatePresence>
  );
}
