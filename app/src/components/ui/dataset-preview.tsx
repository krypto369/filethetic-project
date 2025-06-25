"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { JsonViewer } from "@/components/ui/json-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatasetPreviewProps {
  data: any[];
  className?: string;
  downloadable?: boolean;
  onDownload?: () => void;
}

export function DatasetPreview({
  data,
  className,
  downloadable = true,
  onDownload,
}: DatasetPreviewProps) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"table" | "json">("table");
  
  const itemsPerPage = 10;
  
  // Get all unique columns from the data
  const columns = data.length > 0 
    ? Array.from(new Set(data.flatMap(item => Object.keys(item))))
    : [];
  
  // Filter data based on search term
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return Object.values(item).some(value => 
      String(value).toLowerCase().includes(searchLower)
    );
  });
  
  // Sort data if a sort column is selected
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const valueA = a[sortColumn];
    const valueB = b[sortColumn];
    
    if (valueA === valueB) return 0;
    if (valueA === undefined || valueA === null) return 1;
    if (valueB === undefined || valueB === null) return -1;
    
    const comparison = String(valueA).localeCompare(String(valueB));
    return sortDirection === "asc" ? comparison : -comparison;
  });
  
  // Paginate the data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  // Handle sort toggle
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  
  // Generate pagination items
  const paginationItems = [];
  const maxPaginationItems = 5;
  
  let startPage = Math.max(1, page - Math.floor(maxPaginationItems / 2));
  let endPage = Math.min(totalPages, startPage + maxPaginationItems - 1);
  
  if (endPage - startPage + 1 < maxPaginationItems) {
    startPage = Math.max(1, endPage - maxPaginationItems + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    paginationItems.push(
      <PaginationItem key={i}>
        <PaginationLink
          isActive={page === i}
          onClick={() => setPage(i)}
        >
          {i}
        </PaginationLink>
      </PaginationItem>
    );
  }
  
  // Handle download
  const handleDownloadClick = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = "dataset.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search data..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to first page on search
            }}
          />
        </div>
        
        <div className="flex gap-2">
          <Tabs
            defaultValue="table"
            value={viewMode}
            onValueChange={(value) => setViewMode(value as "table" | "json")}
            className="w-[200px]"
          >
            <TabsList>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {downloadable && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleDownloadClick}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>
      
      {data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No data available
        </div>
      ) : (
        <>
          <TabsContent value="table" className="mt-0">
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead 
                        key={column}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort(column)}
                      >
                        <div className="flex items-center gap-1">
                          {column}
                          {sortColumn === column && (
                            sortDirection === "asc" 
                              ? <ChevronUp className="h-3 w-3" /> 
                              : <ChevronDown className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((column) => (
                        <TableCell key={`${rowIndex}-${column}`}>
                          {typeof row[column] === "object" && row[column] !== null ? (
                            <div className="max-w-xs truncate">
                              {JSON.stringify(row[column])}
                            </div>
                          ) : (
                            String(row[column] ?? "")
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="json" className="mt-0">
            <div className="border rounded-md p-4 bg-muted/30 max-h-[500px] overflow-auto">
              <JsonViewer 
                data={paginatedData} 
                rootName="data" 
                expandLevel={2}
              />
            </div>
          </TabsContent>
          
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(Math.max(1, page - 1))}
                    className={cn({ "pointer-events-none opacity-50": page === 1 })}
                  />
                </PaginationItem>
                
                {paginationItems}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    className={cn({ "pointer-events-none opacity-50": page === totalPages })}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
