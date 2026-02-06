import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "poi-navigoo.pynfi.com" }, // Images du POI Service
      { protocol: "https", hostname: "media-service.pynfi.com" } // Images du Media Service
    ],
  },
  async rewrites() {
    return [
      // 1. POI & Access Logs Service (Backend Initial)
      // Utilisé pour: Organisations, POIs, Reviews, Logs
      {
        source: '/remote-api/:path*',
        destination: 'https://poi-navigoo.pynfi.com/:path*',
      },
      // 2. Auth Service (Authentification Centralisée)
      // Utilisé pour: Login, Register, User Profile
      {
        source: '/auth-api/:path*',
        destination: 'https://auth-service.pynfi.com/:path*',
      },
      // 3. Media Service (Gestion des fichiers)
      // Utilisé pour: Upload, Download images
      {
        source: '/media-api/:path*',
        // Note: J'ai retiré "/webjars" car c'est généralement pour l'UI Swagger. 
        // L'API est sans doute à la racine (ex: /media/upload).
        destination: 'https://media-service.pynfi.com/:path*', 
      },
    ];
  },
};

export default nextConfig;