"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, Users, Smartphone, PlusCircle, Calculator } from "lucide-react";

export function AdminMobileBottomNav() {
  const pathname = usePathname();

  const leftNavItems = [
    { 
      name: "Órdenes", 
      href: "/work-orders", 
      icon: List, 
      activeColor: "text-tertiary", 
      iconColor: "fill-tertiary/20", 
      baseColor: "text-typography/70",
      exact: true
    },
    { 
      name: "Clientes", 
      href: "/clients", 
      icon: Users, 
      activeColor: "text-info", 
      iconColor: "fill-info/20", 
      baseColor: "text-typography/70",
      exact: false
    },
  ];

  const rightNavItems = [
    { 
      name: "Equipos", 
      href: "/devices", 
      icon: Smartphone, 
      activeColor: "text-success", 
      iconColor: "fill-success/20", 
      baseColor: "text-typography/70",
      exact: false
    },
    { 
      name: "Cotizar", 
      href: "/quotes", 
      icon: Calculator, 
      activeColor: "text-primary", 
      iconColor: "fill-primary/20", 
      baseColor: "text-typography/70",
      exact: false
    },
  ];

  const renderNavItem = (item: any) => {
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
        <span className="text-[9px] font-mono uppercase tracking-wider font-semibold">
          {item.name}
        </span>
      </Link>
    );
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/60 pb-safe">
      <div className="flex items-center justify-between h-16 px-1 relative">
        {/* Left Items */}
        <div className="flex-1 flex justify-around items-center h-full">
          {leftNavItems.map(renderNavItem)}
        </div>

        {/* Central Elevated FAB (Mercado Pago Style) */}
        <div className="relative -top-5 flex-shrink-0 mx-2">
          <Link href="/work-orders/new">
            <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-tertiary/20 transform transition-transform active:scale-95 ${
              pathname === "/work-orders/new" 
                ? "bg-tertiary text-tertiary-foreground" 
                : "bg-background border-2 border-tertiary text-tertiary hover:bg-tertiary hover:text-tertiary-foreground"
            }`}>
              <PlusCircle className="w-7 h-7" />
            </div>
          </Link>
        </div>

        {/* Right Items */}
        <div className="flex-1 flex justify-around items-center h-full">
          {rightNavItems.map(renderNavItem)}
        </div>
      </div>
    </nav>
  );
}
