import clsx from 'clsx';

type Option<T> = {
  value: T;
  label: string;
  icon?: string;
};

type Props<T> = {
  options: [Option<T>, Option<T>];
  value: T;
  onChange: (value: T) => void;
  activeColor?: 'amber' | 'purple';
  disabled?: boolean;
};

export function ToggleButtonGroup<T extends string | boolean>({ 
  options, 
  value, 
  onChange,
  activeColor = 'amber',
  disabled = false
}: Props<T>) {
  const getActiveStyles = () => {
    if (activeColor === 'purple') {
      return 'bg-purple-500 text-white shadow-md';
    }
    return 'bg-amber-400 text-amber-950 shadow-md';
  };

  return (
    <div className="flex bg-gray-50 rounded-xl p-1 border-2 border-gray-200">
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all cursor-pointer',
            value === option.value
              ? getActiveStyles()
              : 'text-gray-600 hover:bg-gray-100',
            disabled && 'opacity-50 cursor-not-allowed!'
          )}
        >
          {option.icon && <span className="text-xl">{option.icon}</span>}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}

