import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone only for production builds
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  // Habilitar View Transitions experimental (compatible con next-view-transitions)
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
