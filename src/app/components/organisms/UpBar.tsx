'use client';
import Button from "../atoms/Button";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import menuData from '@/datas/menu.json';

type MenuItem = {
  label: string;
  href: string;
  title: string;
  subtitle: string | null;
  button: {
    href: string;
    label: string;
    labelMobile: string | null;
  } | null;
  children?: MenuItem[];
  editRoutes?: {
    pattern: string;
    title: string;
    subtitle: string | null;
    button: {
      href: string;
      label: string;
      labelMobile: string | null;
    } | null;
  }[];
};

export default function UpBar() {
  const pathname = usePathname();

  const renderButton = (button: { href: string; label: string; labelMobile: string | null } | null) => {
    if (!button) return null;
    
    return (
      <Link href={button.href}>
        <Button>
          <span className="hidden sm:inline">{button.label}</span>
          {button.labelMobile && <span className="sm:hidden">{button.labelMobile}</span>}
        </Button>
      </Link>
    );
  };

  const findRouteInfo = (path: string): { title: string; subtitle: string | null; button: any } | null => {
    // Chercher dans les routes d'édition d'abord
    for (const menuItem of menuData as MenuItem[]) {
      if (menuItem.editRoutes) {
        for (const editRoute of menuItem.editRoutes) {
          if (path.includes(editRoute.pattern.replace('/', ''))) {
            return {
              title: editRoute.title,
              subtitle: editRoute.subtitle,
              button: editRoute.button
            };
          }
        }
      }
    }

    // Chercher dans les routes principales et enfants
    for (const menuItem of menuData as MenuItem[]) {
      // Vérifier la route principale
      if (menuItem.href === path) {
        return {
          title: menuItem.title,
          subtitle: menuItem.subtitle,
          button: menuItem.button
        };
      }

      // Vérifier les routes enfants
      if (menuItem.children) {
        for (const child of menuItem.children) {
          if (child.href === path) {
            return {
              title: child.title,
              subtitle: child.subtitle,
              button: child.button
            };
          }
        }
      }
    }

    return null;
  };

  const upbarInfos = findRouteInfo(pathname);

  if (!upbarInfos) {
    return null;
  }

  return (
    <div className="border-b border-gray-200">
      <div className="flex justify-between items-center p-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">{upbarInfos.title}</h1>
        </div>
        <div className="flex gap-2">
          {upbarInfos.subtitle ? (
            <p className="text-sm sm:text-base text-gray-600">{upbarInfos.subtitle}</p>
          ) : ''}
          {renderButton(upbarInfos.button)}
        </div>
      </div>
    </div>
  );
}
