import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "poi-navigoo.pynfi.com" },
      { protocol: "https", hostname: "media-service.pynfi.com" }
    ],
  },
  async rewrites() {
    return [
      // ✅ PROXY UNIQUE pour le Backend POI
      // Gère: Auth (/api/auth/*), POIs (/api/pois/*), Organizations (/api/organizations/*), etc.
      {
        source: '/remote-api/:path*',
        destination: 'https://poi-navigoo.pynfi.com/:path*',
      },
      
      // ✅ OPTIONNEL : Si vous avez vraiment un Media Service séparé
      // Sinon, commentez cette section
      {
        source: '/media-api/:path*',
        destination: 'https://media-service.pynfi.com/:path*', 
      },
    ];
  },
};

export default nextConfig;