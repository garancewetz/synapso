'use client';

import Image from 'next/image';
import LogoIcon from '@/assets/logo.svg';

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 20, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-15">

      <Image 
        src={LogoIcon} 
        alt="Caly R-évolution Logo" 
        width={size} 
        height={size}
        className="w-auto h-auto"
      />
        </div>
      
      {/* Nom de l'application */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900">Synapso</h1>
      </div>
    </div>
  );
}