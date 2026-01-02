import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & {
  className?: string;
  strokeWidth?: number;
}

export function PlusIcon({ className = 'w-5 h-5', strokeWidth = 2, ...props }: Props) {
  return (
    <svg 
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={strokeWidth} 
        d="M12 4v16m8-8H4" 
      />
    </svg>
  );
}

