import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true, // <-- Permite renderizar SVGs
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Standalone only for production builds
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),

  // Habilitar View Transitions experimental
  experimental: {
    viewTransition: true,
  },

  // Variables de entorno
  env: {
    NEXT_PUBLIC_API_GATEWAY_URL:
      process.env.API_GATEWAY_URL ||
      process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
      'http://api-gateway:8000',
  },
};

export default nextConfig;