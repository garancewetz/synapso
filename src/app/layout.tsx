import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/app/components/organisms/NavBar";
import SiteProtection from "@/app/components/organisms/SiteProtection";
import DevBanner from "@/app/components/atoms/DevBanner";

export const metadata: Metadata = {
  title: "Synapso - Caly",
  description: "Les exercices de Calypso",
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: "Synapso - Caly",
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
    <html lang="en">
      <body
        className={` antialiased`}
      >
        <DevBanner />
        <SiteProtection>
          <div className="px-4 md:px-6 lg:px-8">
            <NavBar />
          </div>
          <main className="flex-1 mx-auto min-h-screen h-full w-full max-w-9xl">
              {children}
          </main>
        </SiteProtection>
      </body>
    </html>
  );
}
