"use client";

import { useMemo } from "react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationControl({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationControlProps) {
  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    const pages = [];
    
    // Always show first page
    if (currentPage > 3) {
      pages.push(1);
    }
    
    // Show ellipsis if needed
    if (currentPage > 4) {
      pages.push(-1); // -1 represents ellipsis
    }
    
    // Show pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 3) {
      pages.push(-1); // -1 represents ellipsis
    }
    
    // Always show last page
    if (currentPage < totalPages - 1 && totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  }, [currentPage, totalPages]);
  
  if (totalPages <= 1) {
    return null;
  }
  
  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
            href="#"
          />
        </PaginationItem>
        
        {pageNumbers.map((pageNumber, idx) => (
          <PaginationItem key={`${pageNumber}-${idx}`}>
            {pageNumber === -1 ? (
              <span className="flex h-9 w-9 items-center justify-center">...</span>
            ) : (
              <PaginationLink
                href="#"
                isActive={pageNumber === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(pageNumber);
                }}
              >
                {pageNumber}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
            href="#"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
