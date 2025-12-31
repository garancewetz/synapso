interface ErrorMessageProps {
  message: string;
  className?: string;
  id?: string;
}

export default function ErrorMessage({ message, className = '', id }: ErrorMessageProps) {
  if (!message) return null;
  
  return (
    <div 
      id={id}
      role="alert"
      aria-live="polite"
      className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded ${className}`}
    >
      {message}
    </div>
  );
}
