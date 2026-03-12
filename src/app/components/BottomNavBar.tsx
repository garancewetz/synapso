'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CATEGORY_LABELS_SHORT,
  CATEGORY_ICONS,
  CATEGORY_MOBILE_STYLES,
  CATEGORY_HREFS,
  CATEGORY_ORDER,
} from '@/app/constants/exercice.constants';
import type { ExerciceCategory } from '@/app/types/exercice';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { TouchLink } from '@/app/components/TouchLink';
import { PlusIcon, BookIcon, SparklesIcon, MenuIcon, CloseIcon, RocketIcon } from '@/app/components/ui/icons';
import { useUser } from '@/app/contexts/UserContext';
import { useLayoutContext } from '@/app/contexts/LayoutContext';

type Props = {
  /** Catégories à afficher en bas (celles utilisées par l'utilisateur). Si non fourni, toutes les catégories sont affichées. */
  categoriesToShow?: ExerciceCategory[];
};

const EXERCICES_ALL_HREF = '/exercices/all';
const ADD_EXERCICE_HREF = '/exercice/add';
const ADD_PROGRES_HREF = '/historique?action=add-progress';
const ADD_NOTE_HREF = '/journal/add';
const JOURNAL_HREF = '/journal';
const SUIVI_HREF = '/historique';

export const BottomNavBar = memo(function BottomNavBar({ categoriesToShow = CATEGORY_ORDER }: Props) {
  const pathname = usePathname();
  const { effectiveUser, loading } = useUser();
  const {
    preserveDate,
    showCategoryMenu,
    navMenuType,
    categoriesSlideOpen,
    setCategoriesSlideOpen,
  } = useLayoutContext();
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  const isHomeActive = pathname === '/';
  const isExercicesAllActive = pathname === EXERCICES_ALL_HREF;
  const isJournalActive = pathname === JOURNAL_HREF || pathname.startsWith(`${JOURNAL_HREF}/`);
  const isSuiviActive = pathname === SUIVI_HREF;
  const hasFullCategories = showCategoryMenu && categoriesToShow.length >= 5;
  const categoriesToRender = showCategoryMenu ? categoriesToShow : [];
  const isSlideMenu = navMenuType === 'slide';

  useEffect(() => {
    if (!addMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [addMenuOpen]);

  if (!effectiveUser || loading) {
    return null;
  }

  if (isSlideMenu) {
    const handleCategoriesClick = () => {
      setCategoriesSlideOpen(!categoriesSlideOpen);
    };
    const navItemClassFirstLine =
      'flex flex-col items-center justify-center w-14 h-14 rounded-2xl shadow-sm bg-white/90 transition-all duration-200 hover:opacity-90 active:opacity-95 shrink-0 gap-0.5';
    const activeClass = 'text-gray-900 ring-2 ring-gray-300 ring-offset-2 ring-offset-transparent';
    const inactiveClass = 'text-gray-600';

    const isSlideExpanded = navMenuType === 'slide' && categoriesSlideOpen;

    const handleAddOptionClick = () => {
      setAddMenuOpen(false);
    };

    return (
      <nav
        className="fixed bottom-0 left-0 right-0 z-60 md:hidden bg-transparent px-2 pb-2 touch-manipulation transform-[translateZ(0)]"
        aria-label="Navigation principale"
      >
        <div className={clsx('backdrop-blur-md bg-white/80 border border-white/70 shadow-lg rounded-2xl flex flex-col transition-all duration-300', isSlideExpanded ? 'pt-2 pb-2' : 'py-2')}>
          <div className={clsx('px-2 flex items-center justify-between gap-1', isSlideExpanded && 'pb-0')}>
          <TouchLink
            href={preserveDate('/')}
            aria-label="Accueil"
            aria-current={isHomeActive ? 'page' : undefined}
            className="flex flex-col items-center justify-end shrink-0"
          >
            <div className={clsx(navItemClassFirstLine, isHomeActive ? activeClass : inactiveClass)}>
              <span className="text-xl leading-none" role="img" aria-hidden="true">
                {NAVIGATION_EMOJIS.HOME}
              </span>
              <span className="text-[10px] font-semibold leading-tight tracking-tight">Accueil</span>
            </div>
          </TouchLink>

          <button
            type="button"
            onClick={handleCategoriesClick}
            aria-label={isSlideExpanded ? 'Fermer les catégories' : 'Ouvrir les catégories'}
            aria-expanded={isSlideExpanded}
            className="flex flex-col items-center justify-end shrink-0"
          >
            <div
              className={clsx(
                navItemClassFirstLine,
                isSlideExpanded
                  ? 'text-gray-700 bg-gray-100 border border-gray-200/60'
                  : inactiveClass
              )}
            >
              {isSlideExpanded ? (
                <CloseIcon className="w-5 h-5 shrink-0" aria-hidden />
              ) : (
                <MenuIcon className="w-5 h-5 shrink-0" aria-hidden />
              )}
              <span className="text-[10px] font-semibold leading-tight tracking-tight">Catégories</span>
            </div>
          </button>

          <div ref={addMenuRef} className="relative flex flex-col items-center justify-end shrink-0">
            <AnimatePresence>
              {addMenuOpen && (
                <motion.div
                  key="add-menu"
                  initial={{ opacity: 0, scale: 0.9, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 4 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-end justify-center gap-4 px-2 py-3 z-10"
                  role="menu"
                  aria-label="Ajouter"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.03, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="flex flex-col items-center translate-x-2 translate-y-1.5"
                  >
                    <TouchLink
                      href={preserveDate(ADD_EXERCICE_HREF)}
                      onClick={handleAddOptionClick}
                      role="menuitem"
                      aria-label="Exercice"
                      className="flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl bg-white/95 backdrop-blur shadow-md border border-gray-200/80 hover:bg-gray-50 active:opacity-90 transition-all text-gray-700"
                    >
                      <PlusIcon className="w-5 h-5 shrink-0" strokeWidth={2} aria-hidden />
                      <span className="text-[10px] font-semibold">Exercice</span>
                    </TouchLink>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="flex flex-col items-center -translate-y-3"
                  >
                    <TouchLink
                      href={preserveDate(ADD_PROGRES_HREF)}
                      onClick={handleAddOptionClick}
                      role="menuitem"
                      aria-label="Progrès"
                      className="flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl bg-white/95 backdrop-blur shadow-md border border-gray-200/80 hover:bg-gray-50 active:opacity-90 transition-all text-gray-700"
                    >
                      <SparklesIcon className="w-5 h-5 shrink-0" strokeWidth={2} aria-hidden />
                      <span className="text-[10px] font-semibold">Progrès</span>
                    </TouchLink>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.09, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="flex flex-col items-center -translate-x-2 translate-y-1.5"
                  >
                    <TouchLink
                      href={preserveDate(ADD_NOTE_HREF)}
                      onClick={handleAddOptionClick}
                      role="menuitem"
                      aria-label="Note"
                      className="flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl bg-white/95 backdrop-blur shadow-md border border-gray-200/80 hover:bg-gray-50 active:opacity-90 transition-all text-gray-700"
                    >
                      <BookIcon className="w-5 h-5 shrink-0" aria-hidden />
                      <span className="text-[10px] font-semibold">Note</span>
                    </TouchLink>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={() => setAddMenuOpen((open) => !open)}
              aria-label="Ajouter"
              aria-expanded={addMenuOpen}
              aria-haspopup="menu"
              className="flex flex-col items-center justify-end shrink-0"
            >
              <div
                className={clsx(
                  navItemClassFirstLine,
                  'w-16 h-16',
                  addMenuOpen ? activeClass : inactiveClass
                )}
              >
                <PlusIcon className="w-7 h-7 shrink-0" strokeWidth={2.5} aria-hidden />
                <span className="text-[10px] font-semibold leading-tight tracking-tight">Ajouter</span>
              </div>
            </button>
          </div>

          <TouchLink
            href={preserveDate(JOURNAL_HREF)}
            aria-label="Journal"
            aria-current={isJournalActive ? 'page' : undefined}
            className="flex flex-col items-center justify-end shrink-0"
          >
            <div className={clsx(navItemClassFirstLine, isJournalActive ? activeClass : inactiveClass)}>
              <BookIcon className="w-5 h-5 shrink-0" aria-hidden />
              <span className="text-[10px] font-semibold leading-tight tracking-tight">Journal</span>
            </div>
          </TouchLink>

          <TouchLink
            href={preserveDate(SUIVI_HREF)}
            aria-label="Suivi"
            aria-current={isSuiviActive ? 'page' : undefined}
            className="flex flex-col items-center justify-end shrink-0"
          >
            <div className={clsx(navItemClassFirstLine, isSuiviActive ? activeClass : inactiveClass)}>
              <RocketIcon className="w-5 h-5 shrink-0" aria-hidden />
              <span className="text-[10px] font-semibold leading-tight tracking-tight">Suivi</span>
            </div>
          </TouchLink>
          </div>

          <div
            className={clsx(
              'overflow-hidden transition-[max-height] duration-300 ease-out',
              !isSlideExpanded && 'pointer-events-none'
            )}
            style={{ maxHeight: isSlideExpanded ? 72 : 0 }}
          >
            <div className={clsx('flex items-center px-2 pt-2 pb-2 rounded-b-2xl', categoriesToShow.length >= 4 ? 'justify-between gap-2' : 'justify-center gap-4')}>
              {categoriesToShow.map((category) => {
                const href = preserveDate(CATEGORY_HREFS[category]);
                const styles = CATEGORY_MOBILE_STYLES[category];
                const icon = CATEGORY_ICONS[category];
                const label = CATEGORY_LABELS_SHORT[category];
                const isActive = pathname === CATEGORY_HREFS[category];
                return (
                  <TouchLink
                    key={category}
                    href={href}
                    aria-label={label}
                    aria-current={isActive ? 'page' : undefined}
                    className="flex flex-col items-center justify-center shrink-0"
                  >
                    <div
                      className={clsx(
                        'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-200',
                        styles.iconBg,
                        styles.iconText,
                        isActive && 'ring-2 ring-gray-300 ring-offset-2 ring-offset-transparent'
                      )}
                    >
                      <span className="text-xl leading-none" role="img" aria-hidden="true">
                        {icon}
                      </span>
                    </div>
                  </TouchLink>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-60 md:hidden bg-transparent px-2 pb-2 touch-manipulation transform-[translateZ(0)]"
      aria-label="Navigation principale"
    >
      <div className="flex flex-col gap-1.5 pt-2">
        {hasFullCategories && (
          <div className="flex justify-between items-end gap-2">
            <TouchLink
              href={preserveDate('/')}
              aria-label="Accueil"
              aria-current={isHomeActive ? 'page' : undefined}
              className="flex flex-col items-center justify-end shrink-0"
            >
              <div
                className={clsx(
                  'flex flex-col items-center justify-center w-14 h-14 rounded-2xl border border-gray-200 bg-white shadow-md transition-all duration-200 hover:opacity-90 active:opacity-95 gap-0',
                  isHomeActive ? 'text-gray-900 ring-2 ring-gray-300 ring-offset-2 ring-offset-transparent' : 'text-gray-600'
                )}
              >
                <span className="text-2xl leading-none" role="img" aria-hidden="true">
                  {NAVIGATION_EMOJIS.HOME}
                </span>
                <span className="text-[10px] font-bold leading-tight">Accueil</span>
              </div>
            </TouchLink>
          </div>
        )}

        <div
          className={clsx(
            'backdrop-blur-md bg-white/80 border border-white/70 shadow-lg rounded-2xl px-2 py-2 flex items-center gap-1',
            (categoriesToRender.length > 3 || !showCategoryMenu) ? 'justify-between' : 'justify-center'
          )}
        >
          {(!hasFullCategories || !showCategoryMenu) && (
            <TouchLink
              href={preserveDate('/')}
              aria-label="Accueil"
              aria-current={isHomeActive ? 'page' : undefined}
              className="flex flex-col items-center justify-end shrink-0"
            >
              <div
                className={clsx(
                  'flex flex-col items-center justify-center w-14 h-14 rounded-2xl border border-gray-200 bg-white shadow-md transition-all duration-200 hover:opacity-90 active:opacity-95 gap-0',
                  isHomeActive ? 'text-gray-900 ring-2 ring-gray-300 ring-offset-2 ring-offset-transparent' : 'text-gray-600'
                )}
              >
                <span className="text-2xl leading-none" role="img" aria-hidden="true">
                  {NAVIGATION_EMOJIS.HOME}
                </span>
                <span className="text-[10px] font-bold leading-tight">Accueil</span>
              </div>
            </TouchLink>
          )}
          {!showCategoryMenu && (
            <TouchLink
              href={preserveDate(EXERCICES_ALL_HREF)}
              aria-label="Exercices"
              aria-current={isExercicesAllActive ? 'page' : undefined}
              className="flex flex-col items-center justify-end shrink-0"
            >
              <div
                className={clsx(
                  'flex flex-col items-center justify-center w-14 h-14 rounded-2xl border border-gray-200 bg-white shadow-md transition-all duration-200 hover:opacity-90 active:opacity-95 gap-0',
                  isExercicesAllActive ? 'text-gray-900 ring-2 ring-gray-300 ring-offset-2 ring-offset-transparent' : 'text-gray-600'
                )}
              >
                <span className="text-2xl leading-none" role="img" aria-hidden="true">💪</span>
                <span className="text-[10px] font-bold leading-tight">Exercices</span>
              </div>
            </TouchLink>
          )}
          {categoriesToRender.map((category) => {
            const href = CATEGORY_HREFS[category];
            const isActive = pathname === href;
            const styles = CATEGORY_MOBILE_STYLES[category];
            const icon = CATEGORY_ICONS[category];
            const label = CATEGORY_LABELS_SHORT[category];
            return (
              <TouchLink
                key={category}
                href={preserveDate(href)}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className={clsx(
                  'flex flex-col items-center justify-end shrink-0 p-1 rounded-2xl transition-all duration-200 bg-transparent',
                  'hover:opacity-90 active:opacity-95',
                  isActive && 'ring-2 ring-gray-300 ring-offset-2 ring-offset-transparent'
                )}
              >
                <div
                  className={clsx(
                    'w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 gap-0 border border-gray-200 shadow-md transition-all duration-200',
                    styles.iconBg,
                    styles.iconText
                  )}
                >
                  <span className="text-2xl leading-none" role="img" aria-hidden="true">
                    {icon}
                  </span>
                  <span className="text-[10px] font-bold leading-tight">{label}</span>
                </div>
              </TouchLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
});
