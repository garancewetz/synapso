interface TagProps {
  children: React.ReactNode;
  icon?: string;
  color?: string;
  className?: string;
}


export default function Tag({ children, icon, color, className = '' }: TagProps) {
  let colorClass = '';
  switch (color) {
    case 'cyan':
      colorClass = 'bg-cyan-100 text-cyan-600 border border-cyan-600';
      break;
    case 'green':
      colorClass = 'bg-green-100 text-green-600 border border-green-600';
      break;
    case 'orange':
        colorClass = 'bg-orange-100 text-orange-600 border border-orange-600';
      break;
    case 'blue':
      colorClass = 'bg-blue-100 text-blue-600 border border-blue-600';
      break;
    case 'yellow':  
      colorClass = 'bg-yellow-100 text-yellow-600 border border-yellow-600';
      break;
    case 'red':
      colorClass = 'bg-red-100 text-red-600 border border-red-600';
      break;
    case 'purple':
      colorClass = 'bg-purple-100 text-purple-600 border border-purple-600';
      break;
    case 'pink':
      colorClass = 'bg-pink-100 text-pink-600 border border-pink-600';
      break;
    case 'gray':
      colorClass = 'bg-gray-100 text-gray-600 border border-gray-600';
      break;
    case 'amber':
      colorClass = 'bg-amber-100 text-amber-600 border border-amber-600';
      break;
    case 'indigo':
      colorClass = 'bg-indigo-100 text-indigo-600 border border-indigo-600';
      break;
    case 'teal':
      colorClass = 'bg-teal-100 text-teal-600 border border-teal-600';
      break;
    case 'rose':
      colorClass = 'bg-rose-100 text-rose-600 border border-rose-600';
      break;
    case 'lime':
      colorClass = 'bg-lime-100 text-lime-600 border border-lime-600';
      break;
    case 'emerald':
      colorClass = 'bg-emerald-100 text-emerald-600 border border-emerald-600';
      break;
    case 'sky':
      colorClass = 'bg-sky-100 text-sky-600 border border-sky-600';
      break;
    case 'violet':
        colorClass = 'bg-violet-100 text-violet-600 border border-violet-600';
      break;
    case 'fuchsia':
      colorClass = 'bg-fuchsia-100 text-fuchsia-600 border border-fuchsia-600';
      break;
    default:
      colorClass = 'currentColor border border-currentColor';
      break;
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass} ${className}`}>
      {icon && <span>{icon} </span>}
      {children}
    </span>
  );
}

