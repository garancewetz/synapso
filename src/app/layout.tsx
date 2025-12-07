import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/app/components/organisms/NavBar";
import SiteProtection from "@/app/components/organisms/SiteProtection";
import DevBanner from "@/app/components/atoms/DevBanner";
import PWARegister from "@/app/components/atoms/PWARegister";
import NotificationManager from "@/app/components/atoms/NotificationManager";
import { UserProvider } from "@/contexts/UserContext";

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
      <body
        className={` antialiased`}
      >
        <PWARegister />
        <UserProvider>
          <NotificationManager />
          <DevBanner />
          <SiteProtection>
            <div className="px-4 md:px-6 lg:px-8">
              <NavBar />
            </div>
            <main className="flex-1 mx-auto min-h-screen h-full w-full max-w-9xl">
                {children}
            </main>
          </SiteProtection>
        </UserProvider>
      </body>
    </html>
  );
}
