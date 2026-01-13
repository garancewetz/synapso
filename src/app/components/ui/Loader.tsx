import clsx from 'clsx';

type Props = {
  size?: 'small' | 'medium' | 'large';
  className?: string;
};

export function Loader({ size = 'medium', className = '' }: Props) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div
        className={clsx(sizeClasses[size], 'border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin')}
        role="status"
        aria-label="Chargement en cours"
      >
        <span className="sr-only">Chargement...</span>
      </div>
    </div>
  );
}

