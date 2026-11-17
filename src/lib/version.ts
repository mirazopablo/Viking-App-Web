import packageInfo from "../../package.json";

const rawVersion =
  process.env.NEXT_PUBLIC_APP_VERSION || packageInfo.version;

/**
 * Application semantic version injected at build time by CI/CD (`NEXT_PUBLIC_APP_VERSION`),
 * falling back to `package.json` during local development.
 */
export const APP_VERSION = rawVersion.startsWith("v")
  ? rawVersion
  : `v${rawVersion}`;

