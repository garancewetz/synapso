import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & {
  className?: string;
  filled?: boolean;
}

export function BookmarkIcon({ className = 'w-4 h-4', filled = true, ...props }: Props) {
  return (
    <svg 
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      viewBox="0 0 24 24"
      {...props}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
      />
    </svg>
  );
}

