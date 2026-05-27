import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthWrapper } from "@/app/components/AuthWrapper";
import { DevBanner } from "@/app/components/DevBanner";
import { AppShellSkeleton } from "@/app/components/AppShellSkeleton";
import { LayoutComposer } from "@/app/LayoutComposer";
import { SiteProtection } from "@/app/features/auth";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { UserProvider } from "@/app/contexts/UserContext";
import { DayDetailModalProvider } from "@/app/contexts/DayDetailModalContext";
import { TimeProvider } from "@/app/contexts/TimeContext";
import { ToastProvider } from "@/app/contexts/ToastContext";
import { ConfettiProvider } from "@/app/contexts/ConfettiContext";

// ⚡ PERFORMANCE: Utiliser next/font pour optimiser le chargement des fonts
// - Hébergement local des fonts (pas de requête externe à Google Fonts)
// - Préchargement automatique
// - Élimination du FOUT (Flash of Unstyled Text)
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Synapso",
  description: "Exercices de rééducation",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Synapso",
    // ⚡ COLD START iOS PWA standalone : remplace l'écran noir natif iOS
    // entre le tap sur l'icône et l'arrivée du HTML par un splash (logo
    // centré sur #F8FAFB). PNGs générés via scripts/generate-apple-splash.mjs.
    // Format média = (device-width × device-height en px CSS) + pixel ratio.
    // Android n'a pas besoin de cela : Chrome génère le splash automatiquement
    // depuis manifest.json (icons + name + background_color).
    startupImage: [
      { url: "/splash/iphone-1320x2868.png", media: "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/splash/iphone-1206x2622.png", media: "(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/splash/iphone-1290x2796.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/splash/iphone-1284x2778.png", media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/splash/iphone-1179x2556.png", media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/splash/iphone-1170x2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/splash/iphone-1242x2688.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/splash/iphone-1125x2436.png", media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/splash/iphone-1242x2208.png", media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/splash/iphone-828x1792.png",  media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
      { url: "/splash/iphone-750x1334.png",  media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
    ],
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  // Next.js 16 n'émet plus `apple-mobile-web-app-capable` (seulement le nouveau
  // standard `mobile-web-app-capable`), mais iOS l'exige toujours pour activer
  // les apple-touch-startup-image. On le réinjecte manuellement.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  openGraph: {
    title: "Synapso",
    description: "Les exercices de Calypso",
    images: [
      {
        url: '/logoBrain.png',
        alt: 'Logo Synapso',
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // ♿ ACCESSIBILITÉ: Permettre le zoom jusqu'à 500% (WCAG 2.1 - niveau AA)
  userScalable: true, // ♿ ACCESSIBILITÉ: Permettre le zoom pour les utilisateurs malvoyants
  themeColor: "#F8FAFB",
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // Cold start: the root layout reads neither cookies nor DB. With no dynamic API
  // in the tree, the entry route `/` is statically prerendered and served from the
  // CDN (instant first byte, no black screen on cold launch). Auth is resolved
  // client-side by UserProvider via fetchUser() (/api/auth/check).
  return (
    <html
      lang="fr"
      className={inter.variable}
      // ⚡ COLD START: fond clair appliqué avant tout CSS chargé (évite l'écran noir
      // du dark mode système ou de l'iOS standalone pendant le boot Lambda)
      style={{ backgroundColor: '#F8FAFB', colorScheme: 'light' }}
    >
      <body
        className={`${inter.className} antialiased`}
        style={{ backgroundColor: '#F8FAFB' }}
      >
        <QueryProvider>
          {/* Fast first paint: route-agnostic shell shown if a child suspends.
              Auth is no longer resolved at SSR — UserProvider loads it client-side
              and exposes `loading`, handled per page via skeletons. */}
          <Suspense fallback={<AppShellSkeleton />}>
            <UserProvider>
              <ToastProvider>
                <DayDetailModalProvider>
                  {/* Suspense pour useSearchParams() dans TimeProvider — fallback={null} pour ne pas bloquer le rendu */}
                  <Suspense fallback={null}>
                    <TimeProvider>
                      <ConfettiProvider>
                        <DevBanner />
                        <AuthWrapper protectionComponent={SiteProtection}>
                          <LayoutComposer>
                            {children}
                          </LayoutComposer>
                        </AuthWrapper>
                      </ConfettiProvider>
                    </TimeProvider>
                  </Suspense>
                </DayDetailModalProvider>
              </ToastProvider>
            </UserProvider>
          </Suspense>
        </QueryProvider>
      </body>
    </html>
  );
}
