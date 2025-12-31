/**
 * Utility function to merge class names
 * Similar to classnames/clsx but lightweight
 * 
 * @example
 * cn('base-class', condition && 'conditional-class', 'another-class')
 * // Returns: 'base-class conditional-class another-class'
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

