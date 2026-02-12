'use client';

import dynamic from 'next/dynamic';

// ⚡ PERFORMANCE: Lazy load des utilitaires non critiques
const WebVitals = dynamic(
  () => import('@/app/components/WebVitals').then(mod => ({ default: mod.WebVitals })),
  { ssr: false }
);

const PWARegister = dynamic(
  () => import('@/app/components/PWARegister').then(mod => ({ default: mod.PWARegister })),
  { ssr: false }
);

export function LayoutUtils() {
  return (
    <>
      <WebVitals />
      <PWARegister />
    </>
  );
}
