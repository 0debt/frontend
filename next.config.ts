import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use standalone output in production (for Docker deployments)
  // In development, this causes slow compilation times
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  
  // Optimize for development with Turbopack
  experimental: {
    // Enable faster refresh in development
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
