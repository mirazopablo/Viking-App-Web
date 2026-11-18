import packageInfo from "../../package.json";

function parseSemver(ver?: string): [number, number, number] {
  if (!ver) return [0, 0, 0];
  const clean = ver.trim().replace(/^v/i, "").split("-")[0];
  const [maj = 0, min = 0, pat = 0] = clean.split(".").map((n) => parseInt(n, 10) || 0);
  return [maj, min, pat];
}

function pickHigherVersion(a?: string, b?: string): string {
  const [aMaj, aMin, aPat] = parseSemver(a);
  const [bMaj, bMin, bPat] = parseSemver(b);

  const aIsHigher =
    aMaj > bMaj ||
    (aMaj === bMaj && aMin > bMin) ||
    (aMaj === bMaj && aMin === bMin && aPat >= bPat);

  const chosen = (aIsHigher ? a : b) || "0.1.0";
  return chosen.startsWith("v") ? chosen : `v${chosen}`;
}

/**
 * Application semantic version: picks the highest version between build-time
 * `NEXT_PUBLIC_APP_VERSION` (injected by CI/CD or next.config.ts) and `package.json`.
 */
export const APP_VERSION = pickHigherVersion(
  process.env.NEXT_PUBLIC_APP_VERSION,
  packageInfo.version
);
