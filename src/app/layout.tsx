import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/app/components/organisms/NavBar";
import BottomNavBar from "@/app/components/organisms/BottomNavBar";
import SiteProtection from "@/app/components/organisms/SiteProtection";
import WelcomeHeaderWrapper from "@/app/components/organisms/WelcomeHeaderWrapper";
import DevBanner from "@/app/components/atoms/DevBanner";
import PWARegister from "@/app/components/atoms/PWARegister";
import NotificationManager from "@/app/components/atoms/NotificationManager";
import { UserProvider } from "@/contexts/UserContext";
import { CategoryProvider } from "@/contexts/CategoryContext";

export const metadata: Metadata = {
  title: "Synapso - Caly",
  description: "Les exercices de Calypso",
  manifest: "/manifest.json",
  themeColor: "#000000",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <PWARegister />
        <UserProvider>
          <CategoryProvider>
            <NotificationManager />
            <DevBanner />
            <SiteProtection>
                <NavBar />
              <WelcomeHeaderWrapper />
              <main className="flex-1 mx-auto w-full max-w-9xl pb-24 md:pb-8">
                {children}
              </main>
              <BottomNavBar />
            </SiteProtection>
          </CategoryProvider>
        </UserProvider>
      </body>
    </html>
  );
}
