'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

type ToastProps = {
  message: string;
  onClose: () => void;
  duration?: number;
};

export function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        'bg-white rounded-lg shadow-lg border border-gray-200',
        'px-4 py-3',
        'min-w-[200px] max-w-[90vw]',
        'text-sm text-gray-700'
      )}
      role="alert"
      aria-live="polite"
    >
      {message}
    </motion.div>
  );
}

type ToastContainerProps = {
  toasts: Array<{ id: string; message: string }>;
  onRemove: (id: string) => void;
};

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto mb-2">
            <Toast
              message={toast.message}
              onClose={() => onRemove(toast.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
