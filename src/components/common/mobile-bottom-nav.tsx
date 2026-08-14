"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarPlus, Search, User } from "lucide-react";
import { useLanguage } from "@/context/language-context";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Do not render the public mobile bottom nav on admin routes
  // since the admin layout provides its own AdminMobileBottomNav
  if (
    pathname.startsWith("/work-orders") ||
    pathname.startsWith("/clients") ||
    pathname.startsWith("/devices")
  ) {
    return null;
  }

  const navItems = [
    { name: t.bottomNav?.home || "Home", href: "/", icon: Home, activeColor: "text-typography", iconColor: "fill-typography/20", baseColor: "text-typography/50" },
    { name: t.bottomNav?.booking || "Book", href: "/booking", icon: CalendarPlus, activeColor: "text-tertiary", iconColor: "fill-tertiary/20", baseColor: "text-tertiary/70" },
    { name: t.bottomNav?.track || "Track", href: "/status", icon: Search, activeColor: "text-info", iconColor: "fill-info/20", baseColor: "text-info/70" },
    { name: t.bottomNav?.staff || "Staff", href: "/login", icon: User, activeColor: "text-success", iconColor: "fill-success/20", baseColor: "text-success/70" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/60 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? item.activeColor : `${item.baseColor} hover:text-typography`
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? item.iconColor : ""}`} />
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
