'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { TouchLink } from '@/app/components/TouchLink';
import { PlusIcon, BookIcon, SparklesIcon } from '@/app/components/ui/icons';
import { useLayoutContext } from '@/app/contexts/LayoutContext';
import { PROGRESS_ADD_HREF } from '@/app/constants/progress.constants';

const ADD_EXERCICE_HREF = '/exercice/add';
const ADD_PROGRES_HREF = PROGRESS_ADD_HREF;
const ADD_NOTE_HREF = '/journal/add';

export function AddMenu() {
  const { preserveDate } = useLayoutContext();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={menuRef} className="relative flex flex-col items-center justify-end shrink-0">
      <AnimatePresence>
        {open && (
          <motion.div
            key="add-menu"
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 4 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-end justify-center gap-4 px-2 py-3 z-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 120%, rgba(255, 255, 255, 0.95), transparent 65%)'
            }}
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
                onClick={handleClose}
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
                onClick={handleClose}
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
                onClick={handleClose}
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
        onClick={handleToggle}
        aria-label="Ajouter"
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex flex-col items-center justify-end shrink-0"
      >
        <div
          className={clsx(
            'flex flex-col items-center justify-center w-14 h-14 rounded-2xl shadow-sm bg-white/90 transition-all duration-200 hover:opacity-90 active:opacity-95 shrink-0 gap-0.5',
            open ? 'text-gray-900 ring-2 ring-gray-300 ring-offset-2 ring-offset-transparent' : 'text-gray-600'
          )}
        >
          <PlusIcon className="w-5 h-5 shrink-0" strokeWidth={2.5} aria-hidden />
          <span className="text-[10px] font-semibold leading-tight tracking-tight">Ajouter</span>
        </div>
      </button>
    </div>
  );
}
