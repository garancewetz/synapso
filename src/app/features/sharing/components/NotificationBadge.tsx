'use client';

import clsx from 'clsx';
import { usePendingShareCount } from '../hooks/usePendingShareCount';

type Props = {
  className?: string;
};

export function NotificationBadge({ className }: Props) {
  const { count } = usePendingShareCount();

  if (count === 0) return null;

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center',
        'min-w-[18px] h-[18px] px-1',
        'bg-red-500 text-white text-[10px] font-bold rounded-full',
        'leading-none',
        className
      )}
      aria-label={`${count} notification${count > 1 ? 's' : ''} en attente`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
