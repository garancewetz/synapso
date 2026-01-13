import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    // 🔒 SÉCURITÉ: Autoriser le microphone pour la dictée vocale
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(self), geolocation=()'
  },
  {
    // 🔒 SÉCURITÉ: Content Security Policy pour prévenir les attaques XSS
    // Note: 'unsafe-inline' et 'unsafe-eval' sont nécessaires pour Next.js (hot reload, _next/static)
    // En production avec Next.js, ces directives sont nécessaires pour le fonctionnement normal
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js nécessite unsafe-eval pour le développement et certaines optimisations
      "style-src 'self' 'unsafe-inline'", // Tailwind CSS et Next.js nécessitent unsafe-inline pour les styles
      "img-src 'self' data: blob:", // data: pour les images inline, blob: pour les images générées
      "font-src 'self'", // Fonts locales uniquement (next/font)
      "connect-src 'self'", // API calls uniquement vers le même origine
      "worker-src 'self' blob:", // Service Worker (blob: nécessaire pour certains navigateurs)
      "frame-ancestors 'none'", // Empêcher l'inclusion dans des iframes
      "base-uri 'self'", // Base URI uniquement depuis la même origine
      "form-action 'self'", // Les formulaires ne peuvent envoyer qu'à la même origine
      "manifest-src 'self'", // Manifest PWA uniquement depuis la même origine
    ].join('; ')
  }
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
