'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/app/components/atoms/Logo';
import menuData from '@/datas/menu.json';
import { useUser } from '@/contexts/UserContext';
import Loader from '@/app/components/atoms/Loader';

export default function NavBar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, setCurrentUser, users, changingUser } = useUser();

  // Filtrer les éléments du menu selon l'utilisateur actif
  const navItems = menuData
    .filter(item => {
      // Afficher le journal d'aphasie uniquement pour Calypso
      if (item.href === '/aphasie') {
        return currentUser?.name === 'Calypso';
      }
      return true;
    })
    .map(item => ({
      label: item.label,
      href: item.href
    }));

  const handleUserChange = (userId: number) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      setCurrentUser(selectedUser);
      // Les composants se rechargeront automatiquement via useEffect quand currentUser change
    }
  };

  return (
    <nav className="bg-white max-w-9xl w-fullmx-auto rounded-full  mb-12">
      <div className="flex items-center justify-between lg:px-6 py-3">
        <Link href="/">
          <Logo size={32} />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-base font-medium transition-colors ${
                  isActive
                    ? 'text-gray-900 border-b-2 border-gray-900 pb-1'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="flex items-center gap-2">
            <select
              value={currentUser?.id || ''}
              onChange={(e) => handleUserChange(Number(e.target.value))}
              disabled={changingUser}
              className="text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            {changingUser && <Loader size="small" />}
          </div>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden px-6 pb-4">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-base font-medium transition-colors py-2 ${
                    isActive
                      ? 'text-gray-900 border-l-4 border-gray-900 pl-3'
                      : 'text-gray-600 hover:text-gray-900 pl-4'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Utilisateur
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={currentUser?.id || ''}
                  onChange={(e) => {
                    handleUserChange(Number(e.target.value));
                    setIsMenuOpen(false);
                  }}
                  disabled={changingUser}
                  className="flex-1 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                {changingUser && <Loader size="small" />}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

