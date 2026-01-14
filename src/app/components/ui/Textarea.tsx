'use client';

import { useRef, useEffect } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  required?: boolean;
};

export function Textarea({ label, required, className = '', value, ...props }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Réinitialiser la hauteur pour obtenir la hauteur réelle du contenu
    textarea.style.height = 'auto';
    // Ajuster la hauteur en fonction du scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  const textareaClasses = clsx(
    'w-full px-3 py-2 border border-gray-300 rounded-md',
    'focus:outline-none focus:ring-2 focus:ring-blue-500',
    'overflow-hidden resize-none',
    className
  );
  
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && '*'}
        </label>
      )}
      <textarea
        {...props}
        ref={textareaRef}
        required={required}
        value={value}
        className={textareaClasses}
      />
    </div>
  );
}

