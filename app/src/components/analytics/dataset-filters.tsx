"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X, Filter, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOptions {
  search?: string;
  status?: "all" | "verified" | "unverified";
  priceRange?: [number, number];
  owners?: string[];
  models?: string[];
  categories?: string[];
  dateRange?: [Date | null, Date | null];
  rowCountRange?: [number, number];
  tokenCountRange?: [number, number];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  showOnlyMine?: boolean;
}

interface DatasetFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  availableOwners?: { id: string; name?: string }[];
  availableModels?: string[];
  availableCategories?: string[];
  className?: string;
  compact?: boolean;
}

export function DatasetFilters({
  onFilterChange,
  availableOwners = [],
  availableModels = [],
  availableCategories = [],
  className,
  compact = false,
}: DatasetFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    status: "all",
    priceRange: [0, 1000],
    owners: [],
    models: [],
    categories: [],
    rowCountRange: [0, 100000],
    tokenCountRange: [0, 10000000],
    sortBy: "createdAt",
    sortDirection: "desc",
    showOnlyMine: false,
  });
  
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(!compact);
  
  // Calculate active filters count
  const updateActiveFiltersCount = (newFilters: FilterOptions) => {
    let count = 0;
    
    if (newFilters.search && newFilters.search.trim() !== "") count++;
    if (newFilters.status && newFilters.status !== "all") count++;
    if (newFilters.owners && newFilters.owners.length > 0) count++;
    if (newFilters.models && newFilters.models.length > 0) count++;
    if (newFilters.categories && newFilters.categories.length > 0) count++;
    if (newFilters.showOnlyMine) count++;
    
    if (
      newFilters.priceRange &&
      (newFilters.priceRange[0] > 0 || newFilters.priceRange[1] < 1000)
    ) count++;
    
    if (
      newFilters.rowCountRange &&
      (newFilters.rowCountRange[0] > 0 || newFilters.rowCountRange[1] < 100000)
    ) count++;
    
    if (
      newFilters.tokenCountRange &&
      (newFilters.tokenCountRange[0] > 0 || newFilters.tokenCountRange[1] < 10000000)
    ) count++;
    
    setActiveFiltersCount(count);
  };
  
  // Apply filter changes
  const applyFilters = (updatedFilters: Partial<FilterOptions>) => {
    const newFilters = { ...filters, ...updatedFilters };
    setFilters(newFilters);
    updateActiveFiltersCount(newFilters);
    onFilterChange(newFilters);
  };
  
  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      search: "",
      status: "all",
      priceRange: [0, 1000],
      owners: [],
      models: [],
      categories: [],
      rowCountRange: [0, 100000],
      tokenCountRange: [0, 10000000],
      sortBy: "createdAt",
      sortDirection: "desc",
      showOnlyMine: false,
    } as FilterOptions;
    
    setFilters(defaultFilters);
    updateActiveFiltersCount(defaultFilters);
    onFilterChange(defaultFilters);
  };
  
  // Toggle selection in array filter
  const toggleArrayFilter = (field: "owners" | "models" | "categories", value: string) => {
    const currentValues = filters[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    applyFilters({ [field]: newValues });
  };
  
  // Render the compact toggle button for mobile/responsive view
  const renderCompactToggle = () => {
    if (!compact) return null;
    
    return (
      <Button
        variant="outline"
        className="w-full flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </span>
        <span className="text-xs text-muted-foreground">
          {isExpanded ? "Hide" : "Show"}
        </span>
      </Button>
    );
  };
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Refine dataset results</CardDescription>
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8"
              onClick={resetFilters}
            >
              Reset all
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {renderCompactToggle()}
        
        {(isExpanded || !compact) && (
          <>
            <div className="space-y-4">
              {/* Search input */}
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search datasets..."
                  value={filters.search || ""}
                  onChange={(e) => applyFilters({ search: e.target.value })}
                />
              </div>
              
              {/* Status filter */}
              <div>
                <Label htmlFor="status">Verification Status</Label>
                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) => applyFilters({ status: value as any })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All datasets</SelectItem>
                    <SelectItem value="verified">Verified only</SelectItem>
                    <SelectItem value="unverified">Unverified only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Show only mine switch */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-mine"
                  checked={filters.showOnlyMine || false}
                  onCheckedChange={(checked) => applyFilters({ showOnlyMine: checked })}
                />
                <Label htmlFor="show-mine">Show only my datasets</Label>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {/* Price range filter */}
                <AccordionItem value="price">
                  <AccordionTrigger className="text-sm font-medium">
                    Price Range
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between text-sm">
                        <span>{filters.priceRange?.[0] || 0} USDFC</span>
                        <span>{filters.priceRange?.[1] || 1000} USDFC</span>
                      </div>
                      <Slider
                        defaultValue={[0, 1000]}
                        min={0}
                        max={1000}
                        step={10}
                        value={filters.priceRange}
                        onValueChange={(value) => applyFilters({ priceRange: value as [number, number] })}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Model filter */}
                {availableModels.length > 0 && (
                  <AccordionItem value="models">
                    <AccordionTrigger className="text-sm font-medium">
                      Models
                      {filters.models && filters.models.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {filters.models.length}
                        </Badge>
                      )}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {availableModels.map((model) => (
                          <div key={model} className="flex items-center space-x-2">
                            <Checkbox
                              id={`model-${model}`}
                              checked={filters.models?.includes(model) || false}
                              onCheckedChange={() => toggleArrayFilter("models", model)}
                            />
                            <Label
                              htmlFor={`model-${model}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {model}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {/* Categories filter */}
                {availableCategories.length > 0 && (
                  <AccordionItem value="categories">
                    <AccordionTrigger className="text-sm font-medium">
                      Categories
                      {filters.categories && filters.categories.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {filters.categories.length}
                        </Badge>
                      )}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {availableCategories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={filters.categories?.includes(category) || false}
                              onCheckedChange={() => toggleArrayFilter("categories", category)}
                            />
                            <Label
                              htmlFor={`category-${category}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {/* Row count range */}
                <AccordionItem value="row-count">
                  <AccordionTrigger className="text-sm font-medium">
                    Row Count
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between text-sm">
                        <span>{filters.rowCountRange?.[0] || 0}</span>
                        <span>{filters.rowCountRange?.[1] || 100000}+</span>
                      </div>
                      <Slider
                        defaultValue={[0, 100000]}
                        min={0}
                        max={100000}
                        step={1000}
                        value={filters.rowCountRange}
                        onValueChange={(value) => applyFilters({ rowCountRange: value as [number, number] })}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Token count range */}
                <AccordionItem value="token-count">
                  <AccordionTrigger className="text-sm font-medium">
                    Token Count
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between text-sm">
                        <span>{filters.tokenCountRange?.[0] || 0}</span>
                        <span>{filters.tokenCountRange?.[1] || 10000000}+</span>
                      </div>
                      <Slider
                        defaultValue={[0, 10000000]}
                        min={0}
                        max={10000000}
                        step={100000}
                        value={filters.tokenCountRange}
                        onValueChange={(value) => applyFilters({ tokenCountRange: value as [number, number] })}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              {/* Sort options */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <div className="flex gap-2">
                  <Select
                    value={filters.sortBy || "createdAt"}
                    onValueChange={(value) => applyFilters({ sortBy: value })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Date Created</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="numRows">Row Count</SelectItem>
                      <SelectItem value="numTokens">Token Count</SelectItem>
                      <SelectItem value="numDownloads">Downloads</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => 
                      applyFilters({ 
                        sortDirection: filters.sortDirection === "asc" ? "desc" : "asc" 
                      })
                    }
                  >
                    {filters.sortDirection === "asc" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7M5 22h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 15l9 7 9-7M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"></path>
                      </svg>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Active Filters display */}
            {activeFiltersCount > 0 && (
              <div className="pt-2">
                <Label className="text-xs text-muted-foreground mb-2 block">Active Filters:</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {filters.search && filters.search.trim() !== "" && (
                    <Badge variant="secondary" className="flex items-center gap-1 pr-1">
                      Search: {filters.search}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 ml-1"
                        onClick={() => applyFilters({ search: "" })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {filters.status && filters.status !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1 pr-1">
                      Status: {filters.status}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 ml-1"
                        onClick={() => applyFilters({ status: "all" })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {filters.models && filters.models.length > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1 pr-1">
                      Models: {filters.models.length}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 ml-1"
                        onClick={() => applyFilters({ models: [] })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {/* More active filters badges can be added here */}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
