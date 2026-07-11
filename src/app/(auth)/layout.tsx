import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Auth Layout:
 * Centered layout with Viking Brand background styling, crimson red gradients,
 * and OLED dark contrast for staff/admin portal authentication.
 */
export default function AuthLayout({ children }: Readonly<AuthLayoutProps>) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative Brand Background Gradients */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header linking to Home */}
      <Link
        href="/"
        className="flex flex-col items-center gap-2 mb-8 z-10 text-center hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary rounded-2xl p-2"
      >
        <BrandLogo size="2xl" className="mb-2" />
        <h1 className="text-2xl font-bold tracking-wider text-foreground uppercase">
          Viking App <span className="text-tertiary">Portal</span>
        </h1>
        <p className="text-xs text-typography uppercase tracking-widest font-mono">
          Sistema de Gestión de Taller
        </p>
      </Link>

      {/* Auth Content Container */}
      <div className="w-full max-w-md z-10">{children}</div>

      {/* Footer copyright */}
      <footer className="mt-12 text-center text-xs text-typography/60 z-10 font-mono">
        &copy; {new Date().getFullYear()} Zonda Solutions. Todos los derechos reservados.
      </footer>
    </div>
  );
}
