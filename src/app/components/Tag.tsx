interface TagProps {
  children: React.ReactNode;
  icon?: string;
  color?: string;
  className?: string;
}

const COLOR_CLASSES: Record<string, string> = {
  cyan: 'bg-cyan-50 text-cyan-600 border border-cyan-600',
  green: 'bg-green-50 text-green-600 border border-green-600',
  orange: 'bg-orange-50 text-orange-600 border border-orange-600',
  blue: 'bg-blue-50 text-blue-600 border border-blue-600',
  yellow: 'bg-yellow-50 text-yellow-600 border border-yellow-600',
  red: 'bg-red-50 text-red-600 border border-red-600',
  purple: 'bg-purple-50 text-purple-600 border border-purple-600',
  pink: 'bg-pink-50 text-pink-600 border border-pink-600',
  gray: 'bg-gray-50 text-gray-600 border border-gray-600',
  amber: 'bg-amber-50 text-amber-600 border border-amber-600',
  indigo: 'bg-indigo-50 text-indigo-600 border border-indigo-600',
  teal: 'bg-teal-50 text-teal-600 border border-teal-600',
  rose: 'bg-rose-50 text-rose-600 border border-rose-600',
  lime: 'bg-lime-50 text-lime-600 border border-lime-600',
  emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-600',
  sky: 'bg-sky-50 text-sky-600 border border-sky-600',
  violet: 'bg-violet-50 text-violet-600 border border-violet-600',
  fuchsia: 'bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-600',
};

export default function Tag({ children, icon, color, className = '' }: TagProps) {
  const colorClass = color ? COLOR_CLASSES[color] || 'bg-gray-100 text-gray-600 border border-gray-300' : 'bg-gray-100 text-gray-600 border border-gray-300';

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass} ${className}`}>
      {icon && <span>{icon} </span>}
      {children}
    </span>
  );
}
