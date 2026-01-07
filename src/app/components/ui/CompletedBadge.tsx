import { CheckIcon } from '@/app/components/ui/icons';
import clsx from 'clsx';

type Props = {
  isCompletedToday: boolean;
  completedAt?: Date | string | null;
};

const getDayName = (date: Date | string | null): string => {
  if (!date) return 'Cette semaine';
  
  const completedDate = date instanceof Date ? date : new Date(date);
  
  if (isNaN(completedDate.getTime())) {
    return 'Cette semaine';
  }
  
  const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const dayIndex = completedDate.getDay();
  const dayName = dayNames[dayIndex];
  
  return dayName.charAt(0).toUpperCase() + dayName.slice(1);
};

export function CompletedBadge({ isCompletedToday, completedAt }: Props) {
  return (
    <span className={clsx(
      'shrink-0 text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1',
      isCompletedToday 
        ? 'bg-emerald-500 text-white' 
        : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
    )}>
      <CheckIcon className="w-3.5 h-3.5" />
      {isCompletedToday ? 'Fait' : getDayName(completedAt as Date)}
    </span>
  );
}

