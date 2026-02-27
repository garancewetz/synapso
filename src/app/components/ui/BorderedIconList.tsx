'use client';

import Link from 'next/link';
import { CheckIcon } from './icons';

export type BorderedIconListItem = {
  key: React.Key;
  label: string;
  icon: string;
  borderClass: string;
  href?: string;
  secondaryLabel?: string;
  completed?: boolean;
};

type Props = {
  title: string;
  titleId?: string;
  titleClassName?: string;
  ariaLabel: string;
  items: BorderedIconListItem[];
  onItemClick?: (e: React.MouseEvent) => void;
};

const baseRowClass = 'flex items-center gap-2 px-3 py-2 text-sm text-gray-700 min-h-[44px]';
const linkRowClass = `${baseRowClass} hover:bg-gray-100/80 active:bg-gray-100 transition-colors`;

function RowContent({ item }: { item: BorderedIconListItem }) {
  return (
    <>
      <span className="shrink-0" aria-hidden>
        {item.icon}
      </span>
      <span className="min-w-0 truncate flex-1">{item.label}</span>
      {item.completed && (
        <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0" aria-label="Complété" />
      )}
      {item.secondaryLabel && (
        <span className="text-xs text-gray-500 shrink-0">{item.secondaryLabel}</span>
      )}
    </>
  );
}

function ListItem({ item, onItemClick }: { item: BorderedIconListItem; onItemClick?: (e: React.MouseEvent) => void }) {
  return (
    <li className={`border-0 border-l-[3px] ${item.borderClass} bg-gray-50/50`}>
      {item.href ? (
        <Link href={item.href} className={linkRowClass} onClick={onItemClick}>
          <RowContent item={item} />
        </Link>
      ) : (
        <span className={baseRowClass}><RowContent item={item} /></span>
      )}
    </li>
  );
}

/**
 * Liste à bordure gauche colorée par ligne (icône + libellé).
 * Même style que les exercices liés (journal) et la modale détail du jour.
 */
export function BorderedIconList({ title, titleId, titleClassName, ariaLabel, items, onItemClick }: Props) {
  if (items.length === 0) return null;

  return (
    <div aria-labelledby={titleId || undefined}>
      <p
        id={titleId}
        className={titleClassName ?? 'text-sm font-semibold text-gray-700 mb-1.5'}
      >
        {title}
      </p>
      <ul
        className="rounded-lg border border-gray-100 overflow-hidden"
        aria-label={ariaLabel}
      >
        {items.map((item) => (
          <ListItem key={item.key} item={item} onItemClick={onItemClick} />
        ))}
      </ul>
    </div>
  );
}
