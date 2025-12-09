'use client';

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 20, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
        <div className="lg:w-15">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={size} height={size} role="img" aria-labelledby="title-desc" className="w-5 h-5 md:w-8 md:h-8">
        <title id="title">Logo Synapso</title>
        <defs>
          <clipPath id="clipBrain">
            <path d="M50 6
                     C71 6 90 23 90 46
                     C90 70 73 92 50 92
                     C27 92 10 70 10 46
                     C10 23 29 6 50 6 Z"/>
          </clipPath>
        </defs>

        <g clipPath="url(#clipBrain)">
          <rect x="0" y="0" width="50" height="100" fill="#000"/>
        </g>

        <path d="M50 6
                 C71 6 90 23 90 46
                 C90 70 73 92 50 92
                 C27 92 10 70 10 46
                 C10 23 29 6 50 6 Z"
              fill="none" stroke="#000" strokeWidth="1"/>
      </svg>
        </div>
      
      {/* Nom de l'application */}
      <div className="text-center hidden md:block">
        <h1 className="text uppercase text-gray-900">Synapso</h1>
      </div>
    </div>
  );
}