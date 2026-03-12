import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & {
  className?: string;
};

export function TrashIcon({ className = 'w-5 h-5', ...props }: Props) {
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
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-3h4m-6 0h8m-9 3h10M10 11v6m4-6v6"
      />
    </svg>
  );
}

