"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip
} from "recharts";

interface BarChartWrapperProps {
  title: string;
  description: string;
  data: Array<Record<string, any>>;
  xAxisKey: string;
  barKey: string;
  barColor?: string;
  isLoading?: boolean;
}

export function BarChartWrapper({
  title,
  description,
  data,
  xAxisKey,
  barKey,
  barColor = "#8884d8",
  isLoading = false
}: BarChartWrapperProps) {
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
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey={barKey} fill={barColor} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
