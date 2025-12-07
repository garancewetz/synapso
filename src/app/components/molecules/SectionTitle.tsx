interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionTitle({ children, className = '' }: SectionTitleProps) {
  return (
    <h2 className={`text-lg uppercase text-gray-900 mb-3 sm:mb-4 relative ${className}`}>
      <span className='bg-white z-1 pr-3'>{children}</span>
      <hr className='my-4 border-gray-200 absolute w-full left-0 top-0 h-1 -z-1' />
    </h2>
  );
}

