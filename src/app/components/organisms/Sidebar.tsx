'use client';

import { usePathname } from 'next/navigation';
import Logo from '../atoms/Logo';
import Link from 'next/link';
import menuData from '@/datas/menu.json';


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
          <Link href="/">
            <Logo size={50} className="mb-8" />
          </Link>

        <div className="mb-8">
          <nav className="flex flex-col gap-2">
            <ul>
              {menuData.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-4 py-3 text-base font-semibold rounded-lg transition-colors ${pathname === item.href
                        ? 'text-blue-700 bg-blue-100 border-l-4 border-blue-500'
                        : 'text-gray-800 hover:text-blue-700 hover:bg-gray-50'
                      }`}
                  >
                    {item.label}
                  </Link>
                  {item.children && item.children.length > 0 && (
                    <ul>
                      {item.children.map((child) => (
                        <li key={child.href} className='my-1'>
                          <Link
                            href={child.href}
                            className={`ml-6 px-3 py-2 text-sm font-normal rounded-md transition-colors ${pathname === child.href
                                ? 'text-blue-600 bg-blue-50 border-l-2 border-blue-400'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              }`}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>


      </header>
    </>
  );
}
