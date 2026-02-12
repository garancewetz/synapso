import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthWrapper } from "@/app/components/AuthWrapper";
import { DevBanner } from "@/app/components/DevBanner";
import { LayoutComponents } from "@/app/components/LayoutComponents";
import { LayoutUtils } from "@/app/components/LayoutUtils";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { UserProvider } from "@/app/contexts/UserContext";
import { DayDetailModalProvider } from "@/app/contexts/DayDetailModalContext";
import { SelectedDateProvider } from "@/app/contexts/SelectedDateContext";
import { TimeProvider } from "@/app/contexts/TimeContext";
import { ToastProvider } from "@/app/contexts/ToastContext";

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
  return (
    <html lang="fr" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <LayoutUtils />
        <QueryProvider>
          <UserProvider>
            <ToastProvider>
              <DayDetailModalProvider>
                {/* Suspense pour gérer useSearchParams() dans les composants enfants */}
                {/* fallback={null} car on ne veut pas bloquer le rendu de l'application */}
                <Suspense fallback={null}>
                  <SelectedDateProvider>
                    <TimeProvider>
                      <DevBanner />
                      <AuthWrapper>
                        <LayoutComponents>
                          {children}
                        </LayoutComponents>
                      </AuthWrapper>
                    </TimeProvider>
                  </SelectedDateProvider>
                </Suspense>
              </DayDetailModalProvider>
            </ToastProvider>
          </UserProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
