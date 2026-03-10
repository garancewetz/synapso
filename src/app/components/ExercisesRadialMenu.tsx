'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { ExerciceCategory } from '@/app/types/exercice';
import {
  CATEGORY_HREFS,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  CATEGORY_LABELS_SHORT,
  CATEGORY_COLORS,
} from '@/app/constants/exercice.constants';
import { useLayoutContext } from '@/app/contexts/LayoutContext';

const RADIUS = 115;
const BUBBLE_HEIGHT = 64;
const HITBOX_PADDING = 12;
const HITBOX_SIZE = BUBBLE_HEIGHT + HITBOX_PADDING * 2;

const RADIAL_ORDER: ExerciceCategory[] = ['FACE', 'UPPER_BODY', 'STRETCHING', 'CORE', 'LOWER_BODY'];

const HORIZONTAL_COMPRESSION = 0.8;

function getBubblePosition(index: number) {
  const count = RADIAL_ORDER.length;
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

export function ExercisesRadialMenu({ isOpen }: Props) {
  const pathname = usePathname();
  const { preserveDate } = useLayoutContext();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="radial-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 -translate-x-1/2 z-55 pointer-events-none md:hidden"
            style={{
              bottom: 0,
              width: RADIUS * 2.4,
              height: 225,
            }}
            aria-hidden
          >
            <div
              className="w-full h-full bg-white/70 backdrop-blur-sm rounded-t-[100%]"
            />
          </motion.div>
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
              style={{ width: RADIUS * 2, height: RADIUS + BUBBLE_HEIGHT }}
            >
              {RADIAL_ORDER.map((category, index) => {
                const { x, y } = getBubblePosition(index);
                const isEdge = index === 0 || index === RADIAL_ORDER.length - 1;
                const isMiddle = index >= 1 && index <= 3;
                const adjustedY = isEdge ? y - 12 : isMiddle ? y + 10 : y;
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
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 24,
                      delay: index * 0.05,
                    }}
                    style={{
                      position: 'absolute',
                      left: RADIUS + x - HITBOX_SIZE / 2,
                      bottom: BUBBLE_HEIGHT - adjustedY - HITBOX_SIZE / 2,
                      width: HITBOX_SIZE,
                      height: HITBOX_SIZE,
                    }}
                    className="flex flex-col items-center justify-center pointer-events-auto"
                  >
                    <Link
                      href={href}
                      aria-label={label}
                      aria-current={isActive ? 'page' : undefined}
                      className={clsx(
                        'flex flex-col items-center justify-center shrink-0 rounded-xl shadow-md',
                        'active:scale-95 transition-all py-1.5 px-2 min-w-[52px]',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900',
                        isActive && 'ring-2 ring-offset-2 ring-offset-white',
                        isActive && styles.ring,
                        styles.iconBg
                      )}
                    >
                      <span
                        className={clsx('text-2xl flex items-center justify-center leading-none', styles.iconText)}
                        role="img"
                        aria-hidden="true"
                      >
                        {icon}
                      </span>
                      <span
                        className={clsx(
                          'text-[11px] font-semibold text-center leading-tight mt-0.5 px-0.5',
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
