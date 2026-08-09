"use client";

import React from "react";
import { Navbar } from "@/components/common/navbar";
import { MobileBottomNav } from "@/components/common/mobile-bottom-nav";

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * Public Layout:
 * Uses the shared Navbar and MobileBottomNav for consistent UX
 * across all public-facing pages (status, etc.)
 */
export default function PublicLayout({ children }: Readonly<PublicLayoutProps>) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground relative pb-20 md:pb-0">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 z-10 flex flex-col items-center justify-start">
        {children}
      </main>

      <MobileBottomNav />
    </div>
  );
}
