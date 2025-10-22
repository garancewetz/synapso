'use client';

import { usePathname } from 'next/navigation';
import Logo from '../atoms/Logo';
import Link from 'next/link';

export default function HistorySidebar() {
  const pathname = usePathname();
  
  return (
    <header className="w-60 border-r border-gray-200 flex flex-col p-4 h-screen overflow-y-auto">
      <Logo size={50} className="mb-8" />
      
      <div className="mb-8">
        <nav className="flex flex-col gap-2">
          <Link 
            href="/" 
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              pathname === '/' 
                ? 'text-gray-900 bg-blue-50 border border-blue-200' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Exercices
          </Link>
          <Link 
            href="/historique" 
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              pathname === '/historique' 
                ? 'text-gray-900 bg-blue-50 border border-blue-200' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Historique
          </Link>
        </nav>
      </div>
    </header>
  );
}
