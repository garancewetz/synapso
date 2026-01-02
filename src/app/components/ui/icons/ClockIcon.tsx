import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & {
  className?: string;
  strokeWidth?: number;
}

export function ClockIcon({ className = 'w-4 h-4', strokeWidth = 2, ...props }: Props) {
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
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
      />
    </svg>
  );
}

