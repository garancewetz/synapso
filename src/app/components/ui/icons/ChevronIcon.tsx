import { SVGProps } from 'react';

interface ChevronIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const rotations = {
  up: 'rotate-180',
  down: '',
  left: 'rotate-90',
  right: '-rotate-90',
};

export function ChevronIcon({ 
  className = 'w-4 h-4', 
  direction = 'down',
  ...props 
}: ChevronIconProps) {
  return (
    <svg 
      className={`${className} ${rotations[direction]}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M19 9l-7 7-7-7" 
      />
    </svg>
  );
}

