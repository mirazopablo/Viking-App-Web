import type { NextConfig } from "next";
import { execSync } from "node:child_process";
import packageInfo from "./package.json";

function parseSemver(ver?: string): [number, number, number] {
  if (!ver) return [0, 0, 0];
  const clean = ver.trim().replace(/^v/i, "").split("-")[0];
  const [maj = 0, min = 0, pat = 0] = clean.split(".").map((n) => parseInt(n, 10) || 0);
  return [maj, min, pat];
}

function pickHigherVersion(a?: string, b?: string): string {
  const [aMaj, aMin, aPat] = parseSemver(a);
  const [bMaj, bMin, bPat] = parseSemver(b);
  if (aMaj !== bMaj) return aMaj > bMaj ? a! : b!;
  if (aMin !== bMin) return aMin > bMin ? a! : b!;
  return aPat >= bPat ? (a || b || "0.1.0") : (b || "0.1.0");
}

function resolveAppVersion(): string {
  if (process.env.NEXT_PUBLIC_APP_VERSION) {
    return pickHigherVersion(process.env.NEXT_PUBLIC_APP_VERSION, packageInfo.version);
  }
  try {
    const latestTag = execSync("git describe --tags --abbrev=0", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    if (latestTag) {
      return pickHigherVersion(latestTag, packageInfo.version);
    }
  } catch {
    // Fallback to package.json when git tags are not available
  }
  return packageInfo.version;
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: resolveAppVersion(),
  },
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "viking-app.vercel.app",
    "192.168.100.24",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "viking-app.vercel.app",
        "http://[IP_ADDRESS]",
      ],
    },
  },
};

export default nextConfig;
