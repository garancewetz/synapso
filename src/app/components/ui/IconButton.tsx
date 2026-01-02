import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isActive?: boolean;
  activeClassName?: string;
};

export function IconButton({ 
  children, 
  isActive = false, 
  activeClassName = 'bg-red-50 text-red-600 border-red-200',
  className = 'cursor-pointer',
  ...props 
}: Props) {
  const baseStyles = 'flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 border';
  const inactiveStyles = 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700';
  
  return (
    <button
      className={clsx(
        baseStyles,
        isActive ? activeClassName : inactiveStyles,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

