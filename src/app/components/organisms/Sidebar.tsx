'use client';

import { usePathname } from 'next/navigation';
import Logo from '../atoms/Logo';
import Link from 'next/link';


export default function Sidebar({ isOpen = true, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-white/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <header className={`fixed lg:static inset-y-0 left-0 z-50 w-60 border-r border-gray-200 flex flex-col p-4 h-screen overflow-y-auto bg-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
        <Logo size={50} className="mb-8" />

        <div className="mb-8">
          <nav className="flex flex-col gap-2">
            <ul>
              <li>
                <Link
                  href="/"
                  className={`block px-4 py-3 text-base font-semibold rounded-lg transition-colors ${pathname === '/'
                      ? 'text-blue-700 bg-blue-100 border-l-4 border-blue-500'
                      : 'text-gray-800 hover:text-blue-700 hover:bg-gray-50'
                    }`}
                >
                  Exercices
                </Link>
                <ul>
                  <li className='my-1'>
                    <Link
                      href="/historique"
                      className={`ml-6 px-3 py-2 text-sm font-normal rounded-md transition-colors ${pathname === '/historique'
                          ? 'text-blue-600 bg-blue-50 border-l-2 border-blue-400'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      Historique
                    </Link>
                  </li>
                  <li className='my-1'>
                    <Link
                    href="/exercice/add"
                      className={`ml-6 px-3 py-2 text-sm font-normal rounded-md transition-colors ${pathname === '/exercice/add'
                          ? 'text-blue-600 bg-blue-50 border-l-2 border-blue-400'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >

                    Ajouter un exercice
                    </Link>

                  </li>
                </ul>
              </li>
              <li>
                <Link
                  href="/aphasie"
                  className={`block px-4 py-3 text-base font-semibold rounded-lg transition-colors ${pathname === '/aphasie'
                    ? 'text-blue-700 bg-blue-100 border-l-4 border-blue-500'
                    : 'text-gray-800 hover:text-blue-700 hover:bg-gray-50'
                  }`}

                >
                  Aphasie
                </Link>
                <ul>
                
                  <li className='my-1'>
                    <Link
                    href="/aphasie/add"
                      className={`ml-6 px-3 py-2 text-sm font-normal rounded-md transition-colors ${pathname === '/aphasie/add'
                          ? 'text-blue-600 bg-blue-50 border-l-2 border-blue-400'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >

                    Ajouter une citation
                    </Link>

                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>


      </header>
    </>
  );
}