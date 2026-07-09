import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface VikingLoaderProps {
  count?: number;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

/**
 * VikingLoader:
 * Responsive grid skeleton loader for workshop dashboard views.
 * Eliminates repetitive skeleton boilerplate across admin pages.
 */
export function VikingLoader({
  count = 6,
  columns = 3,
  className = "",
}: Readonly<VikingLoaderProps>) {
  const colMap: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${colMap[columns]} gap-4 pt-2 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={`viking-loader-${index}`} className="bg-card/50 border-border/60 p-5 space-y-4">
          <Skeleton className="h-6 w-3/4 bg-secondary" />
          <Skeleton className="h-4 w-1/2 bg-secondary" />
          <Skeleton className="h-16 w-full bg-secondary" />
        </Card>
      ))}
    </div>
  );
}
