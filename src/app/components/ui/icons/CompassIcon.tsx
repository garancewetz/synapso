import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & {
  className?: string;
  strokeWidth?: number;
}

export function CompassIcon({ className = 'w-5 h-5', strokeWidth = 2, ...props }: Props) {
  return (
    <svg 
      className={className} 
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Cercle extérieur */}
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        strokeWidth={strokeWidth}
      />
      {/* Aiguille Nord */}
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={strokeWidth} 
        d="M12 2v6" 
      />
      {/* Aiguille Sud */}
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={strokeWidth} 
        d="M12 16v6" 
      />
      {/* Aiguille Est */}
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={strokeWidth} 
        d="M16 12h6" 
      />
      {/* Aiguille Ouest */}
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={strokeWidth} 
        d="M2 12h6" 
      />
      {/* Centre */}
      <circle 
        cx="12" 
        cy="12" 
        r="2" 
        fill="currentColor"
      />
    </svg>
  );
}

