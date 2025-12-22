'use client';

interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Si true, les boutons prennent toute la largeur disponible */
  fullWidth?: boolean;
  /** Taille du composant */
  size?: 'sm' | 'md';
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  fullWidth = false,
  size = 'sm',
  className = '',
}: SegmentedControlProps<T>) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2.5 text-sm',
  };

  return (
    <div className={`flex bg-gray-100 rounded-lg p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            ${fullWidth ? 'flex-1' : ''}
            ${sizeClasses[size]}
            font-medium rounded-md transition-all duration-200
            ${value === option.value
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

