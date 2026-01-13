import { Card } from '@/app/components/ui/Card';
import clsx from 'clsx';

type Props = {
  value: number | string;
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
};

/**
 * Composant de carte de statistique carrée
 * Affiche une valeur en grand et un label en petit
 * Utilise Card pour la cohérence du système de design
 */
export function StatsCard({ value, label, bgColor, textColor, borderColor }: Props) {
  return (
    <Card
      variant="outlined"
      padding="sm"
      className={clsx(
        'flex flex-col items-center justify-center text-center min-h-[90px]',
        bgColor,
        borderColor
      )}
    >
      <div className={clsx('text-2xl font-bold', textColor)}>{value}</div>
      <div className={clsx('text-[10px] font-semibold mt-1', textColor)}>{label}</div>
    </Card>
  );
}

