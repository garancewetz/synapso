import clsx from 'clsx';
import { InlineSpinner } from './InlineSpinner';

type Props = {
  /** Taille du spinner — mêmes valeurs que InlineSpinner (sm=16px, md=20px, lg=32px, xl=48px) */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

export function Loader({ size = 'lg', className }: Props) {
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <InlineSpinner size={size} />
    </div>
  );
}

