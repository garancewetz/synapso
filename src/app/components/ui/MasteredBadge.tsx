import { SparklesIcon } from '@/app/components/ui/icons';
import clsx from 'clsx';

type Props = {
  className?: string;
};

export function MasteredBadge({ className }: Props) {
  return (
    <span className={clsx(
      'shrink-0 text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1',
      'bg-emerald-500 text-white',
      className
    )}>
      <SparklesIcon className="w-3.5 h-3.5" />
      Maîtrisé
    </span>
  );
}

