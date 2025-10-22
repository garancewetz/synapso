interface FilterButtonProps {
  isActive: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}

export default function FilterButton({ isActive, onClick, label, count }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer text-left text-sm px-3 py-2 rounded transition-colors flex items-center justify-between ${
        isActive
          ? 'bg-gray-900 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <span>{label}</span>
      {count !== undefined && <span>{count}</span>}
    </button>
  );
}

