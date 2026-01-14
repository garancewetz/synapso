import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'secondary' | 'danger' | 'action' | 'danger-outline' | 'golden' | 'simple';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'md' | 'lg' | 'full';
  iconOnly?: boolean;
  isActive?: boolean;
  activeClassName?: string;
};

/**
 * Composant Button réutilisable avec support du forwardRef
 * 
 * Note: Utilise `export const` avec forwardRef car c'est la convention React
 * pour les composants qui nécessitent le forwardRef
 */
export const Button = forwardRef<HTMLButtonElement, Props>(function Button({
  children,
  onClick,
  variant = 'action',
  type = 'button',
  disabled = false,
  className = '',
  icon,
  iconPosition = 'left',
  size = 'md',
  rounded = 'md',
  iconOnly = false,
  isActive = false,
  activeClassName = 'bg-red-50 text-red-600 border-red-200',
  ...props
}, ref) {
  // Styles pour iconOnly (ancien IconButton)
  if (iconOnly) {
    const baseStyles = 'flex items-center justify-center h-10 w-10 rounded-lg transition-all duration-200 border cursor-pointer';
    const inactiveStyles = 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700';
    
    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
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

  // Styles normaux pour Button
  const baseStyles = 'flex items-center justify-center gap-2 cursor-pointer font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'px-3 h-10 text-sm',
    md: 'px-4 h-12 text-base',
    lg: 'px-5 h-14 text-lg',
  };

  const roundedStyles = {
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };
  
  const variantStyles = {
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    action: 'bg-blue-600 text-white hover:bg-blue-700',
    'danger-outline': 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-300',
    golden: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 hover:from-amber-500 hover:via-yellow-500 hover:to-amber-600 shadow-lg hover:shadow-xl',
    simple: 'bg-gray-800 text-white hover:bg-gray-700',
  };

  const iconElement = icon && (
    <span className={clsx(
      'flex items-center justify-center shrink-0',
      size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
    )}>
      {icon}
    </span>
  );

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        baseStyles,
        sizeStyles[size],
        roundedStyles[rounded],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon && iconPosition === 'left' && iconElement}
      {children}
      {icon && iconPosition === 'right' && iconElement}
    </button>
  );
});

