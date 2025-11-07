'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/app/components/atoms/Logo';
import LogoBrain from '@/assets/logoBrain.svg';
import menuData from '@/datas/menu.json';
import Image from 'next/image';

export default function NavBar() {
  const pathname = usePathname();

  const navItems = menuData.map(item => ({
    label: item.label,
    href: item.href
  }));

  return (
    <nav className="bg-white max-w-9xl w-fullmx-auto rounded-full  mb-12">
      <div className="flex items-center justify-between px-6 py-3">
        <Link href="/">
          <Logo size={32} />
        </Link>

        <div className="flex gap-8">
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
        </div>
      </div>
    </nav>
  );
}

