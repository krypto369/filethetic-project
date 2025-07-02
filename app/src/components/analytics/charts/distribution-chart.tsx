"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Define distribution entry type
type Distribution = Record<string, number>;

interface DistributionChartProps {
  title: string;
  description: string;
  distribution: Distribution;
  isLoading?: boolean;
}

export function DistributionChart({ 
  title, 
  description, 
  distribution, 
  isLoading = false 
}: DistributionChartProps) {
  // Colors for pie chart segments
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];
  
  // Transform data for the chart
  const chartData = Object.entries(distribution).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length]
  }));
  
  // Calculate the total to use for percentages
  const total = Object.values(distribution).reduce((acc, value) => acc + value, 0);
  
  // Custom label for pie chart segments
  const renderCustomizedLabel = ({ 
    cx, 
    cy, 
    midAngle, 
    innerRadius, 
    outerRadius, 
    percent 
  }: any) => {
    if (percent < 0.05) return null; // Don't show labels for tiny slices
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize="12"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><div className="h-6 w-40 bg-muted animate-pulse rounded"></div></CardTitle>
          <CardDescription><div className="h-4 w-60 bg-muted animate-pulse rounded"></div></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} (${((value as number) / total * 100).toFixed(1)}%)`, null]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {chartData.map((item, index) => (
            <Badge key={index} variant="outline" className="flex gap-1.5 items-center">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span>{item.name}: {((item.value / total) * 100).toFixed(1)}%</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
