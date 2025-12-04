import { execSync } from "child_process";
import type { NextConfig } from "next";

function getVersion(): string {
  try {
    return execSync("git describe --tags --always").toString().trim();
  } catch {
    return "dev";
  }
}

const APP_VERSION = getVersion();

const nextConfig: NextConfig = {
  // Standalone only for production builds
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  // Habilitar View Transitions experimental (compatible con next-view-transitions)
  experimental: {
    viewTransition: true,
  },
  // Build ID basado en la versión de Git
  generateBuildId: () => APP_VERSION,
  // Exponer versión al runtime
  env: {
    APP_VERSION,
  },
};

export default nextConfig;
