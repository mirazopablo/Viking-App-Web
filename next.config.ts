import type { NextConfig } from "next";

// Leemos la URL del backend desde el entorno.
// Si no existe, usamos localhost como fallback para desarrollo.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:65298";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "viking-app.vercel.app",
    process.env.TAILSCALE_DOMAIN || ""
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "viking-app.vercel.app",
        process.env.TAILSCALE_DOMAIN || ""
      ],
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/viking/api/:path*`,
      },
      {
        source: "/auth/:path*",
        destination: `${BACKEND_URL}/viking/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;