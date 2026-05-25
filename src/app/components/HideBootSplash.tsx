'use client';

import { useEffect } from 'react';

// ⚡ COLD START: cache le splash inline (#boot-splash) dès que React a hydraté.
// Le splash est rendu en pur HTML/CSS dans <body> avant tout JS,
// pour couvrir l'écran noir du Lambda cold start (~3s première ouverture du jour)
// et l'écran noir de l'iOS standalone pendant le boot.
export function HideBootSplash() {
  useEffect(() => {
    const splash = document.getElementById('boot-splash');
    if (!splash) return;
    splash.style.opacity = '0';
    const cleanup = () => splash.remove();
    const onTransitionEnd = () => cleanup();
    splash.addEventListener('transitionend', onTransitionEnd, { once: true });
    // Fallback si transitionend ne se déclenche pas (display:none parent, etc.)
    const fallback = window.setTimeout(() => {
      splash.removeEventListener('transitionend', onTransitionEnd);
      cleanup();
    }, 600);
    return () => window.clearTimeout(fallback);
  }, []);
  return null;
}
