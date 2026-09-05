import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface VikingPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function VikingPagination({
  currentPage,
  totalPages,
  onPageChange,
}: VikingPaginationProps) {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  // Logic to show a limited number of page buttons
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="h-8 px-2 text-xs font-mono uppercase bg-card border-border hover:bg-secondary/40 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Anterior
      </Button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <div key={`ellipsis-${index}`} className="flex items-center justify-center w-8 h-8 text-typography">
                <MoreHorizontal className="w-4 h-4" />
              </div>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <Button
              key={`page-${page}`}
              variant={isCurrent ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className={`w-8 h-8 p-0 text-xs font-mono ${
                isCurrent
                  ? "bg-info text-white border-info hover:bg-info/90 font-bold"
                  : "bg-card border-border hover:bg-secondary/40 text-typography"
              }`}
            >
              {page}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="h-8 px-2 text-xs font-mono uppercase bg-card border-border hover:bg-secondary/40 disabled:opacity-50"
      >
        Siguiente
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
