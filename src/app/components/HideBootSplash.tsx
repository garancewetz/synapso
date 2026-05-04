'use client';

import { useEffect } from 'react';

// ⚡ COLD START: cache le splash inline (#boot-splash) dès que React a hydraté.
// Le splash est rendu en pur HTML/CSS dans <body> avant tout JS,
// pour couvrir l'écran noir du Lambda cold start (~3s première ouverture du jour).
export function HideBootSplash() {
  useEffect(() => {
    const splash = document.getElementById('boot-splash');
    if (!splash) return;
    splash.style.opacity = '0';
    const cleanup = () => splash.remove();
    splash.addEventListener('transitionend', cleanup, { once: true });
    const fallback = window.setTimeout(cleanup, 600);
    return () => window.clearTimeout(fallback);
  }, []);
  return null;
}
