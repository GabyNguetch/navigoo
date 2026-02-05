"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { OnboardingProvider } from "@/context/OnBoardingContext";
import { Navbar } from "@/components/shared/Navbar";
import { CookieConsent } from "@/components/shared/CookiesConsent";
import { AppDownloadBanner } from "@/components/shared/AppDownloadBanner";
import { FloatingCreateButton } from "@/components/shared/FloatingCreateButton";
import { OnboardingTips } from "@/components/shared/OnBoardingTips";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Pages sans navbar (carte principale, auth, admin)
  const hideNavbar = ["/", "/signin", "/register", "/admin"].includes(pathname);
  
  // Pages sans bouton flottant
  const hideFloatingButton = ["/signin", "/register", "/admin", "/add-poi"].includes(pathname);

  return (
    <html lang="fr">
      <head>
        <title>Navigoo - Explorer le Cameroun</title>
        <meta name="description" content="Découvrez, partagez et naviguez vers les meilleurs endroits du Cameroun" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <OnboardingProvider>
          {!hideNavbar && <Navbar />}
          
          <main className={hideNavbar ? "" : "pt-16"}>
            {children}
          </main>
          
          {!hideFloatingButton && <FloatingCreateButton />}
          
          <CookieConsent />
          <AppDownloadBanner />
          <OnboardingTips />
        </OnboardingProvider>
      </body>
    </html>
  );
}