'use client';

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { TouchLink } from '@/app/components/TouchLink';
import clsx from 'clsx';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  /** Si fourni, rend un <a> via TouchLink au lieu d'un <button> */
  href?: string;
  variant?: 'secondary' | 'danger' | 'action' | 'danger-outline' | 'success';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'md' | 'lg';
  iconOnly?: boolean;
  isActive?: boolean;
  activeClassName?: string;
};

const baseStyles = 'flex items-center justify-center gap-2 cursor-pointer font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.97]';

const sizeStyles = {
  sm: 'px-3 min-h-[44px] h-11 text-sm',
  md: 'px-4 min-h-[44px] h-11 text-base',
  lg: 'px-5 min-h-[44px] h-11 text-lg',
};

const roundedStyles = {
  md: 'rounded-md',
  lg: 'rounded-lg',
};

const variantStyles = {
  secondary: 'bg-gray-100 text-gray-700 border border-gray-200 md:hover:bg-gray-200 md:hover:ring-2 md:hover:ring-gray-300/50 md:hover:ring-offset-2',
  success: 'border border-emerald-200 bg-emerald-50 text-emerald-700 md:hover:bg-emerald-100 md:hover:ring-2 md:hover:ring-emerald-300/50 md:hover:ring-offset-2',
  danger: 'bg-rose-500 text-white md:hover:bg-rose-600 md:hover:ring-2 md:hover:ring-rose-300/60 md:hover:ring-offset-2',
  action: 'bg-blue-500 text-white md:hover:bg-blue-600 md:hover:ring-2 md:hover:ring-blue-300/60 md:hover:ring-offset-2',
  'danger-outline': 'bg-rose-50 text-rose-600 md:hover:bg-rose-100 border border-rose-200 md:hover:ring-2 md:hover:ring-rose-200/50 md:hover:ring-offset-2',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button({
  children,
  href,
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
  'aria-label': ariaLabel,
  ...props
}, ref) {
  // Styles pour iconOnly — zone tactile ≥ 44px (WCAG / Apple HIG)
  if (iconOnly) {
    const iconBaseStyles = 'flex items-center justify-center min-h-[44px] min-w-[44px] h-11 w-11 rounded-lg transition-all duration-200 ease-out border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 active:scale-[0.97]';
    const inactiveStyles = 'bg-white text-gray-500 border-gray-200 md:hover:border-gray-300 md:hover:text-gray-700 md:hover:ring-2 md:hover:ring-gray-300/50 md:hover:ring-offset-2';
    const iconClassName = clsx(iconBaseStyles, isActive ? activeClassName : inactiveStyles, className);

    if (href) {
      return (
        <TouchLink href={href} className={iconClassName} aria-label={ariaLabel}>
          {children}
        </TouchLink>
      );
    }
    return (
      <button ref={ref} type={type} onClick={onClick} disabled={disabled} className={iconClassName} aria-label={ariaLabel} {...props}>
        {children}
      </button>
    );
  }

  const buttonClassName = clsx(
    baseStyles,
    sizeStyles[size],
    roundedStyles[rounded],
    variantStyles[variant],
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  const iconElement = icon && (
    <span className={clsx(
      'flex items-center justify-center shrink-0',
      size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
    )}>
      {icon}
    </span>
  );

  const content = (
    <>
      {icon && iconPosition === 'left' && iconElement}
      {children}
      {icon && iconPosition === 'right' && iconElement}
    </>
  );

  // Mode lien : rend un <a> sémantiquement correct via TouchLink
  if (href) {
    return (
      <TouchLink href={href} className={buttonClassName} aria-label={ariaLabel}>
        {content}
      </TouchLink>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClassName}
      aria-label={ariaLabel}
      {...props}
    >
      {content}
    </button>
  );
});
