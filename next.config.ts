// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Liste des domaines autorisés pour les images externes
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "example.com", // Ajouté pour corriger l'erreur actuelle
      },
      {
        protocol: "https", // Cas où le backend héberge lui-même des images
        hostname: "**.pynfi.com", 
      },
      {
        protocol: "http",
        hostname: "localhost",
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/remote-api/:path*',
        destination: 'https://poi-navigoo.pynfi.com/:path*',
      },
    ];
  },
};

export default nextConfig;