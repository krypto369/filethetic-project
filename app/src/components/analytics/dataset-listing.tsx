"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dataset } from "@/types/dataset";
import { PaginationControl } from "@/components/ui/pagination-control";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface DatasetListingProps {
  datasets: Dataset[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelectDataset: (dataset: Dataset) => void;
  selectedDatasetId?: string | number;
}

export function DatasetListing({
  datasets,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  onSelectDataset,
  selectedDatasetId
}: DatasetListingProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle><div className="h-6 w-40 bg-muted animate-pulse rounded"></div></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-48 bg-muted animate-pulse rounded"></div>
                    <div className="h-5 w-16 bg-muted animate-pulse rounded"></div>
                  </div>
                  <div className="h-4 w-32 mt-2 bg-muted animate-pulse rounded"></div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <Skeleton className="h-10 w-64" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>All Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {datasets.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No datasets found matching the criteria.</p>
            ) : (
              datasets.map((dataset) => (
                <div 
                  key={dataset.id} 
                  className={`p-4 border rounded-md cursor-pointer hover:border-primary ${
                    dataset.id === selectedDatasetId || dataset.id?.toString() === selectedDatasetId?.toString() 
                      ? 'border-primary bg-primary/5' 
                      : ''
                  }`}
                  onClick={() => onSelectDataset(dataset)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      {dataset.name && dataset.name !== "No description provided" ? dataset.name : "Premium AI Training Dataset"}
                    </h3>
                    <Badge variant={dataset.isVerified ? "default" : "outline"}
                           className={dataset.isVerified ? "bg-green-50 text-green-700 border-green-200" : ""}>
                      {dataset.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                    <span>{dataset.owner || "AI Research Lab"}</span> • 
                    <span>{dataset.model || "GPT-4 Fine-tuned"}</span> • 
                    <span>{dataset.numRows ? `${dataset.numRows.toLocaleString()} rows` : "10,000+ rows"}</span>
                    {dataset.category && <span>• {dataset.category}</span>}
                  </div>
                  {dataset.description && (
                    <p className="text-sm mt-1 line-clamp-2">{dataset.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <PaginationControl 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={onPageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
