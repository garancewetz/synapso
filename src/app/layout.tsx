import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/app/components/NavBar";
import { BottomNavBar } from "@/app/components/BottomNavBar";
import { AuthWrapper } from "@/app/components/AuthWrapper";
import { WelcomeHeaderWrapper } from "@/app/components/WelcomeHeaderWrapper";
import { CategoryTabsWrapper } from "@/app/components/CategoryTabsWrapper";
import { DevBanner } from "@/app/components/DevBanner";
import { PWARegister } from "@/app/components/PWARegister";
import { UserProvider } from "@/app/contexts/UserContext";
import { CategoryProvider } from "@/app/contexts/CategoryContext";
import { DayDetailModalProvider } from "@/app/contexts/DayDetailModalContext";
import { DayDetailModalWrapper } from "@/app/components/DayDetailModalWrapper";

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
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <PWARegister />
        <UserProvider>
          <CategoryProvider>
            <DayDetailModalProvider>
              <DevBanner />
              <AuthWrapper>
                <NavBar />
                <WelcomeHeaderWrapper />
                <CategoryTabsWrapper />
                <main className="flex-1 mx-auto w-full max-w-9xl pb-24 md:pb-8">
                  {children}
                </main>
                <BottomNavBar />
                <DayDetailModalWrapper />
              </AuthWrapper>
            </DayDetailModalProvider>
          </CategoryProvider>
        </UserProvider>
      </body>
    </html>
  );
}
