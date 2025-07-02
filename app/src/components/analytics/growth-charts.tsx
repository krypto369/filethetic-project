"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Legend
} from "recharts";

// Monthly dataset creation data (mock data)
const monthlyData = [
  { name: "Jan", datasets: 5 },
  { name: "Feb", datasets: 8 },
  { name: "Mar", datasets: 12 },
  { name: "Apr", datasets: 10 },
  { name: "May", datasets: 15 },
  { name: "Jun", datasets: 20 },
  { name: "Jul", datasets: 18 },
];

interface GrowthChartsProps {
  loading?: boolean;
}

export function GrowthCharts({ loading = false }: GrowthChartsProps) {
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

  // Calculate cumulative datasets
  const cumulativeData = monthlyData.reduce((acc, curr, index) => {
    const prevCumulative = index > 0 ? acc[index - 1].cumulative : 0;
    return [
      ...acc,
      {
        month: curr.name,
        datasets: curr.datasets,
        cumulative: prevCumulative + curr.datasets
      }
    ];
  }, [] as Array<{ month: string; datasets: number; cumulative: number }>);
  
  return (
    <div className="space-y-4">
      {/* Platform Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Growth</CardTitle>
          <CardDescription>
            Cumulative datasets over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cumulative" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* User Adoption Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Adoption</CardTitle>
          <CardDescription>
            New creators joining the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { month: "Jan", creators: 2 },
                  { month: "Feb", creators: 3 },
                  { month: "Mar", creators: 5 },
                  { month: "Apr", creators: 4 },
                  { month: "May", creators: 7 },
                  { month: "Jun", creators: 9 },
                  { month: "Jul", creators: 6 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="creators" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
