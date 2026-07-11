"use client";

import React, { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { MoveHorizontal, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface BeforeAfterSliderProps {
  beforeImage: string | StaticImageData;
  afterImage: string | StaticImageData;
  beforeLabel?: string;
  afterLabel?: string;
  title: string;
  description: string;
  category?: string;
}

/**
 * BeforeAfterSlider:
 * Interactive visual comparison component for Viking App workshop showcases.
 * Allows B2B and retail clients to slide and compare dirty/damaged hardware vs restored equipment.
 */
export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "ANTES",
  afterLabel = "DESPUÉS",
  title,
  description,
  category = "Restauración de Hardware",
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [imageError, setImageError] = useState<{ before: boolean; after: boolean }>({
    before: false,
    after: false,
  });

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <Card className="bg-card/80 backdrop-blur-md border-border/80 overflow-hidden shadow-xl hover:border-tertiary/50 transition-all duration-300 group">
      <CardContent className="p-0 flex flex-col">
        {/* Interactive Image Container */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden select-none bg-secondary/30">
          {/* AFTER Image (Background full layer) */}
          <div className="absolute inset-0 w-full h-full">
            {!imageError.after ? (
              <Image
                src={afterImage}
                alt={afterLabel}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                onError={() => setImageError((prev) => ({ ...prev, after: true }))}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-success/20 to-secondary flex items-center justify-center p-6 text-center">
                <span className="font-mono text-xs text-success/80">[MUESTRA DESPUÉS: {afterLabel}]</span>
              </div>
            )}
            {/* After Label Badge */}
            <div className="absolute top-4 right-4 z-10 bg-success/80 backdrop-blur-md text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md tracking-wider uppercase border border-white/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{afterLabel}</span>
            </div>
          </div>

          {/* BEFORE Image (Foreground clipped layer) */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden transition-[width] duration-75 ease-out"
            style={{ width: `${sliderPosition}%` }}
          >
            <div className="relative w-full h-full" style={{ width: "100vw", maxWidth: "800px" }}>
              {!imageError.before ? (
                <Image
                  src={beforeImage}
                  alt={beforeLabel}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  onError={() => setImageError((prev) => ({ ...prev, before: true }))}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-error/20 to-secondary flex items-center justify-center p-6 text-center">
                  <span className="font-mono text-xs text-error/80">[MUESTRA ANTES: {beforeLabel}]</span>
                </div>
              )}
            </div>
            {/* Before Label Badge */}
            <div className="absolute top-4 left-4 z-10 bg-error/80 backdrop-blur-md text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md tracking-wider uppercase border border-white/20">
              <span>{beforeLabel}</span>
            </div>
          </div>

          {/* Divider Line & Slider Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-tertiary shadow-[0_0_10px_rgb(var(--tertiary))] pointer-events-none z-20"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-tertiary text-tertiary-foreground border-2 border-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <MoveHorizontal className="w-4 h-4" />
            </div>
          </div>

          {/* Invisible Range Input Overlay for Drag/Touch events */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={handleRangeChange}
            aria-label="Comparador Antes y Después"
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 m-0"
          />
        </div>

        {/* Metadata Footer */}
        <div className="p-5 sm:p-6 space-y-2 bg-card/60">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-tertiary font-bold px-2 py-0.5 rounded bg-tertiary/10 border border-tertiary/20">
              {category}
            </span>
            <span className="text-xs font-mono text-typography/60">Desliza para comparar</span>
          </div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">{title}</h3>
          <p className="text-xs sm:text-sm text-typography font-mono leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
