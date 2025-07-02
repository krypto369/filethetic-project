"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dataset, DatasetStats } from "@/types/dataset";
import {
  ResponsiveContainer,
  BarChart,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Legend
} from "recharts";

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

interface OverviewChartsProps {
  datasets: Dataset[];
  datasetStats: DatasetStats | null;
  modelDistribution: Record<string, number>;
  categoryDistribution?: Record<string, number>;
  loading: boolean;
}

export function OverviewCharts({
  datasets,
  datasetStats,
  modelDistribution,
  categoryDistribution,
  loading
}: OverviewChartsProps) {
  // Derived statistics
  const totalDatasets = datasetStats?.totalCount || datasets.length;
  const verifiedDatasets = datasetStats?.verifiedCount || datasets.filter(d => d.isVerified === true).length;
  const totalRows = datasetStats?.totalDownloads || datasets.reduce((sum, d) => sum + (d.numRows || 0), 0);
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle><div className="h-6 w-40 bg-muted animate-pulse rounded"></div></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-muted animate-pulse rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Model Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Model Distribution</CardTitle>
          <CardDescription>
            Datasets by model type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(modelDistribution).map(([name, value], index) => ({
                    name,
                    value,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => 
                    `${name}: ${(percent || 0 * 100).toFixed(0)}%`
                  }
                >
                  {Object.keys(modelDistribution).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution if available */}
      {categoryDistribution && Object.keys(categoryDistribution).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Datasets by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(categoryDistribution).map(([name, value]) => ({
                    name,
                    count: value,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance</CardTitle>
          <CardDescription>
            Average rows per dataset by model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(modelDistribution).map(([name]) => {
                  const modelDatasets = datasets.filter(d => d.model === name);
                  const avgRows = modelDatasets.length > 0
                    ? modelDatasets.reduce((acc, d) => acc + (d.numRows || 0), 0) / modelDatasets.length
                    : 0;
                  
                  return {
                    name,
                    avgRows: Math.round(avgRows),
                  };
                })}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgRows" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
