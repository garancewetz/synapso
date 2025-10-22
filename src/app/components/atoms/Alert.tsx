interface AlertProps {
  children: React.ReactNode;
  className?: string;
}

export default function Alert({ children, className = '' }: AlertProps) {
  return (
    <div className={`bg-currentColor-200 text-currentColor  p-2 rounded-lg  text-sm ${className}`}>
      {children}
    </div>
  );
}

