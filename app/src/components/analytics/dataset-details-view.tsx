"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JsonViewer } from "@/components/ui/json-viewer";
import { Dataset } from "@/types/dataset";

interface DatasetDetailsViewProps {
  dataset: Dataset | null;
}

export function DatasetDetailsView({ dataset }: DatasetDetailsViewProps) {
  if (!dataset) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{dataset.name}</CardTitle>
          <Badge variant="outline">{dataset?.numRows || 0} rows</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Owner</p>
              <p className="text-sm text-muted-foreground">{dataset.owner}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Model</p>
              <p className="text-sm text-muted-foreground">{dataset.model || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Rows</p>
              <p className="text-sm text-muted-foreground">{dataset.numRows?.toLocaleString() || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Columns</p>
              <p className="text-sm text-muted-foreground">{dataset.numColumns?.toLocaleString() || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm text-muted-foreground">
                {dataset.createdAt ? new Date(dataset.createdAt).toLocaleDateString() : "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Price</p>
              <p className="text-sm text-muted-foreground">
                {dataset.price ? `${dataset.price} ETH` : "Free"}
              </p>
            </div>
          </div>
          
          {dataset.metadata && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-1">Preview</p>
              <JsonViewer data={dataset.metadata} />
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" className="mr-2">View Details</Button>
            <Button>
              {dataset.price ? "Purchase" : "Download"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
