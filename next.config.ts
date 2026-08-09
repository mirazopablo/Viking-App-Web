import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "viking-app.vercel.app",
    "192.168.100.24"
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "viking-app.vercel.app",
        "http://[IP_ADDRESS]"
      ],
    },
  },
};

export default nextConfig;