import React from "react";
import Image from "next/image";
import logoImg from "@/components/assets/images/LOGO.png";

export type BrandLogoSize = "sm" | "md" | "lg" | "xl" | "2xl";

export interface BrandLogoProps {
  size?: BrandLogoSize;
  className?: string;
  showText?: boolean;
  textVariant?: "portal" | "tech" | "none";
}

/**
 * BrandLogo:
 * Shared atomic component rendering the official Viking App logo with Crimson Red container,
 * OLED glowing shadow, and synchronized dimensions to prevent Tailwind clipping or overflow issues.
 */
export function BrandLogo({
  size = "md",
  className = "",
  showText = false,
  textVariant = "none",
}: BrandLogoProps) {
  // Map semantic sizes to synchronized wrapper and image dimensions
  const sizeConfig: Record<BrandLogoSize, { wrapper: string; imgWidth: number; imgHeight: number; imgClass: string }> = {
    sm: {
      wrapper: "w-10 h-10 rounded-xl",
      imgWidth: 34,
      imgHeight: 34,
      imgClass: "w-8 h-8",
    },
    md: {
      wrapper: "w-12 h-12 rounded-xl",
      imgWidth: 42,
      imgHeight: 42,
      imgClass: "w-10 h-10",
    },
    lg: {
      wrapper: "w-16 h-16 rounded-2xl",
      imgWidth: 56,
      imgHeight: 56,
      imgClass: "w-14 h-14",
    },
    xl: {
      wrapper: "w-24 h-24 rounded-2xl",
      imgWidth: 84,
      imgHeight: 84,
      imgClass: "w-20 h-20",
    },
    "2xl": {
      wrapper: "w-36 h-36 sm:w-40 sm:h-40 rounded-3xl",
      imgWidth: 140,
      imgHeight: 140,
      imgClass: "w-32 h-32 sm:w-36 sm:h-36",
    },
  };

  const currentSize = sizeConfig[size];

  return (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* Crimson Red Glowing Container Box */}
      <div
        className={`relative ${currentSize.wrapper} bg-tertiary/15 border border-tertiary/30 flex items-center justify-center overflow-hidden shadow-lg shadow-tertiary/10 group-hover:scale-105 transition-transform duration-300 shrink-0`}
      >
        <Image
          src={logoImg}
          alt="Viking App Official Logo"
          width={currentSize.imgWidth}
          height={currentSize.imgHeight}
          className={`${currentSize.imgClass} object-contain`}
          priority
        />
      </div>

      {/* Optional Brand Typography */}
      {showText && (
        <div className="flex flex-col justify-center">
          <span className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-foreground group-hover:text-tertiary transition-colors">
            Viking <span className="text-tertiary">App</span>
          </span>
          {textVariant === "portal" && (
            <span className="text-[10px] font-mono tracking-widest text-typography uppercase -mt-1">
              Portal
            </span>
          )}
          {textVariant === "tech" && (
            <span className="text-[10px] font-mono tracking-widest text-typography uppercase -mt-1">
              Tech Solutions
            </span>
          )}
        </div>
      )}
    </div>
  );
}
