import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthWrapper } from "@/app/components/AuthWrapper";
import { DevBanner } from "@/app/components/DevBanner";
import { HideBootSplash } from "@/app/components/HideBootSplash";
import { InitialLoader } from "@/app/components/InitialLoader";
import { LayoutComposer } from "@/app/LayoutComposer";
import { SiteProtection } from "@/app/features/auth";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { UserProvider } from "@/app/contexts/UserContext";
import { DayDetailModalProvider } from "@/app/contexts/DayDetailModalContext";
import { TimeProvider } from "@/app/contexts/TimeContext";
import { ToastProvider } from "@/app/contexts/ToastContext";
import { ConfettiProvider } from "@/app/contexts/ConfettiContext";
import { getInitialAuthData } from "@/app/lib/auth-server";

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
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
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
  // ⚡ STREAMING SSR: pas d'await — la promise est passée à UserProvider qui la résout via use()
  // → le HTML (shell + InitialLoader) part immédiatement, sans attendre la DB
  // → plus d'écran noir au cold start lambda Netlify
  const authPromise = getInitialAuthData();

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
        {/* Styles du splash inline — appliqués avant le CSS Tailwind, sans dépendre du JS */}
        <style
          dangerouslySetInnerHTML={{
            __html: `#boot-splash{position:fixed;inset:0;z-index:9990;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.5rem;background:#F8FAFB;transition:opacity .35s ease-out;pointer-events:none}#boot-splash .boot-splash-logo{width:96px;height:96px;border-radius:9999px;background:linear-gradient(135deg,#1F2937 0 50%,#F3F4F6 50% 100%);border:2px solid #1F2937;box-shadow:0 6px 24px rgba(31,41,55,.15);animation:bootSplashPulse 1.6s ease-in-out infinite}#boot-splash .boot-splash-label{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:1.25rem;font-weight:600;letter-spacing:.04em;color:#374151}@keyframes bootSplashPulse{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.06);opacity:1}}@media(prefers-reduced-motion:reduce){#boot-splash .boot-splash-logo{animation:none}}`,
          }}
        />
        {/* Splash boot inline — visible dès le premier byte HTML, masqué par HideBootSplash après hydration */}
        <div id="boot-splash" aria-hidden="true">
          <div className="boot-splash-logo" />
          <div className="boot-splash-label">Synapso</div>
        </div>
        <HideBootSplash />
        <QueryProvider>
          <Suspense fallback={<InitialLoader />}>
            <UserProvider authPromise={authPromise}>
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
