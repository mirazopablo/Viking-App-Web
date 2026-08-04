import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "viking-app.vercel.app"
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "viking-app.vercel.app"
      ],
    },
  },
};

export default nextConfig;