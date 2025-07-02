"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dataset, DatasetStats } from "@/types/dataset";
import { cn } from "@/lib/utils";

// This is a simplified chart component - in a real application,
// you would likely use a library like recharts, visx, or d3 for more advanced charts
function BarChart({ 
  data, 
  xKey, 
  yKey,
  className,
  height = 200
}: { 
  data: Array<Record<string, any>>,
  xKey: string,
  yKey: string,
  className?: string,
  height?: number
}) {
  // Find the max value for scaling
  const maxValue = Math.max(...data.map(item => item[yKey] || 0));
  
  return (
    <div className={cn("w-full", className)} style={{ height: `${height}px` }}>
      <div className="flex items-end justify-between h-full">
        {data.map((item, index) => {
          const value = item[yKey] || 0;
          const label = item[xKey] || '';
          const percentage = maxValue ? (value / maxValue) * 100 : 0;
          
          return (
            <div 
              key={index} 
              className="flex flex-col items-center flex-1" 
              style={{ height: '100%' }}
            >
              <div 
                className="w-full bg-primary/90 hover:bg-primary rounded-t-sm mx-1"
                style={{ height: `${percentage}%` }}
              />
              <div className="text-xs mt-2 text-center overflow-hidden text-ellipsis w-full">
                {label}
              </div>
              <div className="text-xs font-medium">{value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PieChart({ 
  data,
  nameKey,
  valueKey,
  className
}: {
  data: Array<Record<string, any>>,
  nameKey: string,
  valueKey: string,
  className?: string
}) {
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + (item[valueKey] || 0), 0);
  const colors = [
    'bg-primary', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
  ];
  
  return (
    <div className={cn("flex flex-wrap gap-4", className)}>
      <div className="w-36 h-36 relative rounded-full overflow-hidden">
        {data.map((item, index) => {
          const value = item[valueKey] || 0;
          const percentage = total ? (value / total) * 100 : 0;
          // This is a very simplified pie chart - real implementations would use SVG or Canvas
          // to properly render pie segments with correct angles
          return (
            <div
              key={index}
              className={`absolute ${colors[index % colors.length]}`}
              style={{
                width: '100%',
                height: '100%',
                clip: `rect(0, ${36 * (percentage / 100)}px, 36px, 0)`,
              }}
            />
          );
        })}
      </div>
      <div className="flex flex-col space-y-2">
        {data.map((item, index) => {
          const value = item[valueKey] || 0;
          const name = item[nameKey] || '';
          const percentage = total ? Math.round((value / total) * 100) : 0;
          
          return (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
              <div className="text-sm">
                {name} <span className="font-medium">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// This component displays the key statistics
function StatsDisplay({
  stats,
  className
}: {
  stats: DatasetStats,
  className?: string
}) {
  const statItems = [
    { label: 'Total Datasets', value: stats.totalCount },
    { label: 'Verified Datasets', value: stats.verifiedCount },
    { label: 'Total Downloads', value: stats.totalDownloads },
    { label: 'Average Price', value: `${stats.averagePrice.toFixed(2)} ETH` },
  ];
  
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {statItems.map((item, index) => (
        <Card key={index} className="border border-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{item.value}</div>
            <div className="text-sm text-muted-foreground">{item.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface DataVisualizationProps {
  stats?: DatasetStats;
  className?: string;
  datasets?: Dataset[];
  onSelect?: (dataset: Dataset) => void;
}

export function DataVisualization({ stats, className, datasets, onSelect }: DataVisualizationProps) {
  const [chartType, setChartType] = useState<string>("monthly");
  
  // If we have datasets, render the dataset list
  if (datasets && datasets.length > 0) {
    return (
      <div className={cn("space-y-4", className)}>
        {datasets.map(dataset => (
          <Card 
            key={dataset.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelect && onSelect(dataset)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{dataset.name}</h3>
                  <p className="text-sm text-muted-foreground">{dataset.description || "No description"}</p>
                </div>
                <div className="flex gap-2">
                  {dataset.isVerified && (
                    <Badge variant="outline" className="bg-green-50">Verified</Badge>
                  )}
                  <Badge>{dataset.model || "Unknown"}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Rows:</span> {dataset.numRows || 0}
                </div>
                <div>
                  <span className="text-muted-foreground">Owner:</span> {dataset.owner}
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span> {typeof dataset.createdAt === 'string' ? new Date(dataset.createdAt).toLocaleDateString() : dataset.createdAt ? dataset.createdAt.toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // If we have stats, render the statistics display
  if (stats) {
    return (
      <div className={cn("space-y-8", className)}>
        <StatsDisplay stats={stats} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Growth Chart */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Dataset Growth</CardTitle>
                <CardDescription>Number of new datasets over time</CardDescription>
              </div>
              <Select
                value={chartType}
                onValueChange={(value) => setChartType(value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={stats.growthByMonth} 
              xKey="month" 
              yKey="count"
              height={250}
            />
          </CardContent>
        </Card>
        
        {/* Model Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Model Distribution</CardTitle>
            <CardDescription>Dataset counts by model</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart 
              data={stats.topModels} 
              nameKey="name" 
              valueKey="count"
            />
          </CardContent>
        </Card>
        
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Dataset counts by category</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart 
              data={stats.topCategories} 
              nameKey="name" 
              valueKey="count"
            />
          </CardContent>
        </Card>
        
        {/* Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
            <CardDescription>Public vs. Private datasets</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart 
              data={[
                { name: 'Verified', count: stats.verifiedCount },
                { name: 'Unverified', count: stats.totalCount - stats.verifiedCount },
              ]} 
              nameKey="name" 
              valueKey="count"
            />
          </CardContent>
        </Card>
        
        {/* Access Type */}
        <Card>
          <CardHeader>
            <CardTitle>Access Type</CardTitle>
            <CardDescription>Public vs. Private datasets</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart 
              data={[
                { name: 'Public', count: stats.publicCount },
                { name: 'Private', count: stats.privateCount },
              ]} 
              nameKey="name" 
              valueKey="count"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
  }
  
  // Default case - no data
  return <div className="text-center p-4">No data available</div>;
}
