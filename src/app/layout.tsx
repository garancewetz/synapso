import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/app/components/NavBar";
import BottomNavBar from "@/app/components/BottomNavBar";
import AuthWrapper from "@/app/components/AuthWrapper";
import WelcomeHeaderWrapper from "@/app/components/WelcomeHeaderWrapper";
import CategoryTabsWrapper from "@/app/components/CategoryTabsWrapper";
import DevBanner from "@/app/components/DevBanner";
import PWARegister from "@/app/components/PWARegister";
import { UserProvider } from "@/app/contexts/UserContext";
import { CategoryProvider } from "@/app/contexts/CategoryContext";

export const metadata: Metadata = {
  title: "Synapso",
  description: "Exercices de rééducation",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
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
            <DevBanner />
            <AuthWrapper>
              <NavBar />
              <WelcomeHeaderWrapper />
              <CategoryTabsWrapper />
              <main className="flex-1 mx-auto w-full max-w-9xl pb-24 md:pb-8">
                {children}
              </main>
              <BottomNavBar />
            </AuthWrapper>
          </CategoryProvider>
        </UserProvider>
      </body>
    </html>
  );
}
