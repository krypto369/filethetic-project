"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Search, Download, ChevronDown, ChevronUp, Shield, AlertCircle, CheckCircle, BarChart } from "lucide-react";
import { cn, formatAddress } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EnhancedDatasetViewerProps {
  data: any[];
  metadata?: {
    verified?: boolean;
    verifier?: string;
    signature?: string;
    features?: string[];
    name?: string;
    description?: string;
  };
  className?: string;
  downloadable?: boolean;
  onDownload?: () => void;
}

export function EnhancedDatasetViewer({
  data,
  metadata = {},
  className,
  downloadable = true,
  onDownload,
}: EnhancedDatasetViewerProps) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"table" | "json" | "stats">("table");
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const itemsPerPage = 10;
  
  // Extract features (column names) from data or metadata
  const features = useMemo(() => {
    if (metadata.features && metadata.features.length > 0) {
      return metadata.features;
    }
    return data.length > 0 
      ? Array.from(new Set(data.flatMap(item => Object.keys(item))))
      : [];
  }, [data, metadata.features]);
  
  // Filter data based on search term
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchLower)
      );
    });
  }, [data, searchTerm]);
  
  // Sort data if a sort column is selected
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (!sortColumn) return 0;
      
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];
      
      if (valueA === valueB) return 0;
      if (valueA === undefined || valueA === null) return 1;
      if (valueB === undefined || valueB === null) return -1;
      
      const comparison = String(valueA).localeCompare(String(valueB));
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);
  
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
  
  // Toggle row expansion
  const toggleRowExpansion = (rowIndex: number) => {
    if (expandedRows.includes(rowIndex)) {
      setExpandedRows(expandedRows.filter(i => i !== rowIndex));
    } else {
      setExpandedRows([...expandedRows, rowIndex]);
    }
  };
  
  // Calculate data statistics
  const dataStats = useMemo(() => {
    const stats: Record<string, any> = {
      rowCount: data.length,
      columnCount: features.length,
      columnsStats: {}
    };
    
    // Calculate stats for each column
    features.forEach(feature => {
      const values = data.map(row => row[feature]).filter(val => val !== undefined && val !== null);
      const numericValues = values.filter(val => !isNaN(Number(val))).map(Number);
      
      const columnStats: any = {
        count: values.length,
        nonEmptyCount: values.filter(val => val !== "" && val !== null && val !== undefined).length,
        uniqueCount: new Set(values).size
      };
      
      // Add numeric stats if column has numeric values
      if (numericValues.length > 0) {
        columnStats.min = Math.min(...numericValues);
        columnStats.max = Math.max(...numericValues);
        columnStats.sum = numericValues.reduce((a, b) => a + b, 0);
        columnStats.avg = columnStats.sum / numericValues.length;
      }
      
      // Add type information
      const types = new Set(values.map(val => typeof val));
      columnStats.types = Array.from(types);
      
      stats.columnsStats[feature] = columnStats;
    });
    
    return stats;
  }, [data, features]);
  
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
  const handleDownload = async () => {
    if (onDownload) {
      setIsDownloading(true);
      try {
        await onDownload();
        toast.success("Dataset downloaded successfully");
      } catch (error) {
        console.error("Download error:", error);
        toast.error("Failed to download dataset");
      } finally {
        setIsDownloading(false);
      }
    } else {
      // Default download behavior
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = metadata.name ? `${metadata.name.toLowerCase().replace(/\s+/g, '-')}.json` : "dataset.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Dataset downloaded as JSON");
    }
  };
  
  // Is the row expanded
  const isRowExpanded = (rowIndex: number) => expandedRows.includes(rowIndex);
  
  return (
    <div className={cn("space-y-4", className)}>
      {metadata.name && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{metadata.name}</h3>
          {metadata.description && (
            <p className="text-sm text-muted-foreground">{metadata.description}</p>
          )}
        </div>
      )}
    
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search dataset..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to first page on search
            }}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Tabs
            defaultValue="table"
            value={viewMode}
            onValueChange={(value) => setViewMode(value as "table" | "json" | "stats")}
            className="w-[260px]"
          >
            <TabsList>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {downloadable && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download
                </>
              )}
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ChevronDown className="h-4 w-4" />
                Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>View Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setExpandedRows([])}>Collapse All Rows</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setExpandedRows([...Array(paginatedData.length).keys()])}>Expand All Rows</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                    <TableHead className="w-10"></TableHead>
                    {features.map((feature) => (
                      <TableHead 
                        key={feature}
                        className="cursor-pointer hover:bg-muted/50 whitespace-nowrap"
                        onClick={() => handleSort(feature)}
                      >
                        <div className="flex items-center gap-1">
                          {feature}
                          {sortColumn === feature && (
                            sortDirection === "asc" 
                              ? <ChevronUp className="h-3 w-3" /> 
                              : <ChevronDown className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                    ))}
                    {metadata.verified !== undefined && (
                      <TableHead className="w-10 text-center">Verified</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row, rowIndex) => {
                    const isExpanded = isRowExpanded((page - 1) * itemsPerPage + rowIndex);
                    
                    return (
                      <TableRow 
                        key={rowIndex}
                        className="cursor-pointer hover:bg-muted/30"
                      >
                        <TableCell className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => toggleRowExpansion((page - 1) * itemsPerPage + rowIndex)}
                          >
                            {isExpanded ? 
                              <ChevronUp className="h-4 w-4" /> : 
                              <ChevronDown className="h-4 w-4" />
                            }
                          </Button>
                        </TableCell>
                        {features.map((feature) => {
                          const cellContent = row[feature];
                          const isObject = typeof cellContent === "object" && cellContent !== null;
                          const isLongText = typeof cellContent === "string" && cellContent.length > 100;
                          
                          return (
                            <TableCell key={`${rowIndex}-${feature}`} className="align-top">
                              {isObject ? (
                                isExpanded ? (
                                  <div className="whitespace-pre-wrap max-w-lg overflow-auto">
                                    {JSON.stringify(cellContent, null, 2)}
                                  </div>
                                ) : (
                                  <div className="max-w-[200px] truncate">
                                    {JSON.stringify(cellContent)}
                                  </div>
                                )
                              ) : isLongText ? (
                                isExpanded ? (
                                  <div className="whitespace-pre-wrap">{cellContent}</div>
                                ) : (
                                  <div className="max-w-[200px] truncate">{cellContent}</div>
                                )
                              ) : (
                                String(cellContent ?? "")
                              )}
                            </TableCell>
                          );
                        })}
                        {metadata.verified !== undefined && (
                          <TableCell className="text-center">
                            {metadata.verified ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <CheckCircle className="h-5 w-5 text-green-500 inline-block" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Verified by {metadata.verifier ? formatAddress(metadata.verifier) : "unknown"}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertCircle className="h-5 w-5 text-yellow-500 inline-block" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Not verified
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="json" className="mt-0">
            <div className="border rounded-md p-4 bg-muted/30 max-h-[600px] overflow-auto">
              <JsonViewer 
                data={paginatedData} 
                rootName="data" 
                expandLevel={2}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="mt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Dataset Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Total Rows:</dt>
                      <dd className="font-medium">{dataStats.rowCount.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Total Columns:</dt>
                      <dd className="font-medium">{dataStats.columnCount.toLocaleString()}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              {features.map(feature => {
                const columnStats = dataStats.columnsStats[feature];
                if (!columnStats) return null;
                
                return (
                  <Card key={feature}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base truncate" title={feature}>{feature}</CardTitle>
                      <CardDescription className="text-xs">
                        {columnStats.types.join(", ")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Non-empty values:</dt>
                          <dd className="font-medium">
                            {columnStats.nonEmptyCount}/{columnStats.count} 
                            ({Math.round(columnStats.nonEmptyCount / columnStats.count * 100)}%)
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Unique values:</dt>
                          <dd className="font-medium">
                            {columnStats.uniqueCount} 
                            ({Math.round(columnStats.uniqueCount / columnStats.count * 100)}%)
                          </dd>
                        </div>
                        
                        {columnStats.min !== undefined && (
                          <>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Min:</dt>
                              <dd className="font-medium">{columnStats.min}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Max:</dt>
                              <dd className="font-medium">{columnStats.max}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Average:</dt>
                              <dd className="font-medium">{columnStats.avg.toFixed(2)}</dd>
                            </div>
                          </>
                        )}
                      </dl>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          {totalPages > 1 && viewMode !== "stats" && (
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
