import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns an absolute URL for a given relative image path,
 * using NEXT_PUBLIC_API_URL as the base URL.
 * If the path is already absolute, it returns it as is.
 */
export function getImageUrl(path?: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  // Ensure we don't have double slashes
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
