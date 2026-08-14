"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, Users, Smartphone, PlusCircle } from "lucide-react";

export function AdminMobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { 
      name: "Órdenes", 
      href: "/work-orders", 
      icon: List, 
      activeColor: "text-tertiary", 
      iconColor: "fill-tertiary/20", 
      baseColor: "text-tertiary/70",
      exact: true
    },
    { 
      name: "Clientes", 
      href: "/clients", 
      icon: Users, 
      activeColor: "text-info", 
      iconColor: "fill-info/20", 
      baseColor: "text-info/70",
      exact: false
    },
    { 
      name: "Equipos", 
      href: "/devices", 
      icon: Smartphone, 
      activeColor: "text-success", 
      iconColor: "fill-success/20", 
      baseColor: "text-success/70",
      exact: false
    },
    { 
      name: "Nueva", 
      href: "/work-orders/new", 
      icon: PlusCircle, 
      activeColor: "text-foreground", 
      iconColor: "fill-foreground/20", 
      baseColor: "text-typography/70",
      exact: true
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/60 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          // Determine if active.
          // 'Nueva Orden' is a sub-path of '/work-orders', so exact match is needed for both to avoid double highlighting
          let isActive = false;
          if (item.exact) {
            isActive = pathname === item.href;
          } else {
            isActive = pathname.startsWith(item.href);
          }
          
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? item.activeColor : `${item.baseColor} hover:text-foreground`
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
