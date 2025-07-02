"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dataset, DatasetStats } from "@/types/dataset";

interface DatasetStatsCardsProps {
  stats: DatasetStats | null;
  datasets: Dataset[];
  isLoading: boolean;
}

export function DatasetStatsCards({ stats, datasets, isLoading }: DatasetStatsCardsProps) {
  // Calculate basic statistics if not provided
  const totalDatasets = datasets.length;
  const verifiedDatasets = datasets.filter(d => d.isVerified).length;
  const totalRows = datasets.reduce((acc, d) => acc + (d.numRows || 0), 0);
  const uniqueCreators = new Set(datasets.map(d => d.owner)).size;

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDatasets}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Verified Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{verifiedDatasets}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRows.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Unique Creators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueCreators}</div>
        </CardContent>
      </Card>
    </div>
  );
}
