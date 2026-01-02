import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & {
  className?: string;
  filled?: boolean;
}

export function EditIcon({ className = 'w-4 h-4', filled = false, ...props }: Props) {
  return (
    <svg 
      className={className} 
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
      />
    </svg>
  );
}

