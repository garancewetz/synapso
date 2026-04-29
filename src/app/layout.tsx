import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthWrapper } from "@/app/components/AuthWrapper";
import { DevBanner } from "@/app/components/DevBanner";
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
  themeColor: "#ffffff",
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
    <html lang="fr" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
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
