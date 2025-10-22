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
      className={`cursor-pointer text-left text-sm px-3 py-2 rounded transition-colors flex items-center justify-between w-full ${
        isActive
          ? 'bg-blue-50 text-blue-900 border border-blue-200'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
          isActive 
            ? 'border-blue-600 bg-blue-600' 
            : 'border-gray-300 bg-white'
        }`}>
          {isActive && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <span>{label}</span>
      </div>
      {count !== undefined && (
        <span className={`text-xs px-2 py-1 rounded-full ${
          isActive 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

