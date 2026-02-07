type Props = {
  className?: string;
};

export function DotsIcon({ className = 'w-5 h-5', ...props }: Props) {
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
        d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" 
      />
    </svg>
  );
}
