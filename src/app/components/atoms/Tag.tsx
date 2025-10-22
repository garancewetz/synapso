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
      colorClass = 'bg-cyan-100 text-cyan-500 border border-cyan-500';
      break;
    case 'green':
      colorClass = 'bg-green-100 text-green-500 border border-green-500';
      break;
    case 'orange':
        colorClass = 'bg-orange-100 text-orange-500 border border-orange-500';
      break;
    case 'blue':
      colorClass = 'bg-blue-100 text-blue-500 border border-blue-500';
      break;
    case 'yellow':  
      colorClass = 'bg-yellow-100 text-yellow-500 border border-yellow-500';
      break;
    case 'red':
      colorClass = 'bg-red-100 text-red-500 border border-red-500';
      break;
    case 'purple':
      colorClass = 'bg-purple-100 text-purple-500 border border-purple-500';
      break;
    case 'pink':
      colorClass = 'bg-pink-100 text-pink-500 border border-pink-500';
      break;
    case 'gray':
      colorClass = 'bg-gray-100 text-gray-500 border border-gray-500';
      break;
    case 'amber':
      colorClass = 'bg-amber-100 text-amber-500 border border-amber-500';
      break;
    case 'indigo':
      colorClass = 'bg-indigo-100 text-indigo-500 border border-indigo-500';
      break;
    case 'teal':
      colorClass = 'bg-teal-100 text-teal-500 border border-teal-500';
      break;
    case 'rose':
      colorClass = 'bg-rose-100 text-rose-500 border border-rose-500';
      break;
    case 'lime':
      colorClass = 'bg-lime-100 text-lime-500 border border-lime-500';
      break;
    case 'emerald':
      colorClass = 'bg-emerald-100 text-emerald-500 border border-emerald-500';
      break;
    case 'sky':
      colorClass = 'bg-sky-100 text-sky-500 border border-sky-500';
      break;
    case 'violet':
        colorClass = 'bg-violet-100 text-violet-500 border border-violet-500';
      break;
    case 'fuchsia':
      colorClass = 'bg-fuchsia-100 text-fuchsia-500 border border-fuchsia-500';
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

