import { SVGProps } from 'react';

interface CheckIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
  strokeWidth?: number;
}

export function CheckIcon({ className = 'w-4 h-4', strokeWidth = 2.5, ...props }: CheckIconProps) {
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
        d="M5 13l4 4L19 7" 
      />
    </svg>
  );
}

