"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dataset } from "@/types/dataset";
import { JsonViewer } from "@/components/ui/json-viewer";
import { Badge } from "@/components/ui/badge";

interface DatasetDetailViewProps {
  dataset: Dataset;
}

export function DatasetDetailView({ dataset }: DatasetDetailViewProps) {
  if (!dataset) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="h-6 w-40 bg-muted animate-pulse rounded"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dataset.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium">Dataset Details</h4>
            <dl className="mt-2 space-y-2">
              <div>
                <dt className="text-xs text-muted-foreground">Description</dt>
                <dd className="text-sm">{dataset.description || "No description provided"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Owner</dt>
                <dd className="text-sm font-mono">{dataset.owner}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Created</dt>
                <dd className="text-sm">{dataset.createdAt instanceof Date ? dataset.createdAt.toLocaleDateString() : "Unknown"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd className="text-sm">
                  <Badge variant={dataset.isVerified ? "default" : "outline"}>
                    {dataset.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <h4 className="text-sm font-medium">Statistics</h4>
            <dl className="mt-2 space-y-2">
              <div>
                <dt className="text-xs text-muted-foreground">Size</dt>
                <dd className="text-sm">{(dataset.size || 0 / 1000000).toFixed(2)} MB</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Rows</dt>
                <dd className="text-sm">{(dataset.numRows || 0).toLocaleString() || "Unknown"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Columns</dt>
                <dd className="text-sm">{(dataset.numColumns || 0).toLocaleString() || "Unknown"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Token Count</dt>
                <dd className="text-sm">{(dataset.tokenCount || 0).toLocaleString() || "Unknown"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Downloads</dt>
                <dd className="text-sm">{(dataset.downloads || 0).toLocaleString() || 0}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Model</dt>
                <dd className="text-sm">{dataset.model || "Unknown"}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        {dataset.categories && dataset.categories.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {dataset.categories.map((category, idx) => (
                <Badge key={idx} variant="outline">{category}</Badge>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <h4 className="text-sm font-medium mb-2">JSON Preview</h4>
          <div className="bg-muted rounded p-4 max-h-[300px] overflow-auto">
            <JsonViewer data={dataset} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
