import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone only for production builds
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  // Habilitar View Transitions experimental (compatible con next-view-transitions)
  experimental: {
    viewTransition: true,
  },
  env: {
    NEXT_PUBLIC_API_GATEWAY_URL:
      process.env.API_GATEWAY_URL ||
      process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
      'http://api-gateway:8000',
  },
};

export default nextConfig;
