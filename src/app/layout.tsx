import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/app/components/NavBar";
import { BottomNavBar } from "@/app/components/BottomNavBar";
import { AuthWrapper } from "@/app/components/AuthWrapper";
import { DevBanner } from "@/app/components/DevBanner";
import { PWARegister } from "@/app/components/PWARegister";
import { UserProvider } from "@/app/contexts/UserContext";
import { CategoryProvider } from "@/app/contexts/CategoryContext";
import { DayDetailModalProvider } from "@/app/contexts/DayDetailModalContext";
import { HistoryProvider } from "@/app/contexts/HistoryContext";
import { ToastProvider } from "@/app/contexts/ToastContext";
import { DayDetailModalWrapper } from "@/app/components/DayDetailModalWrapper";
import { GlobalCelebration } from "@/app/components/GlobalCelebration";
import { WebVitals } from "@/app/components/WebVitals";

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
        <WebVitals />
        <PWARegister />
        <UserProvider>
          <HistoryProvider>
            <CategoryProvider>
              <DayDetailModalProvider>
                <ToastProvider>
                  <DevBanner />
                  <AuthWrapper>
                    <NavBar />
                    <main className="flex-1 mx-auto w-full max-w-9xl pb-24 md:pb-8">
                      {children}
                    </main>
                    <BottomNavBar />
                    <DayDetailModalWrapper />
                    <GlobalCelebration />
                  </AuthWrapper>
                </ToastProvider>
              </DayDetailModalProvider>
            </CategoryProvider>
          </HistoryProvider>
        </UserProvider>
      </body>
    </html>
  );
}
