import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & {
  className?: string;
  strokeWidth?: number;
}

export function RocketIcon({ className = 'w-5 h-5', strokeWidth = 2, ...props }: Props) {
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
        d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m4.959 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.25-2.192m-2.13 2.13L2.636 16.78a2.25 2.25 0 001.414 1.414l4.096-4.096M6.738 6.738l-2.23 2.23M2.25 16.5l2.23-2.23m0 0l2.22 2.22m-2.22-2.22l2.22 2.22" 
      />
    </svg>
  );
}
