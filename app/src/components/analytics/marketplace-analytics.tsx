"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dataset, DatasetStats } from "@/types/dataset";
import { Dataset as LegacyDataset } from "@/lib/types";
import { legacyToModernDataset } from "@/lib/type-adapters";
import { toast } from "sonner";
import { fetchDatasets, fetchDatasetStats, getAvailableFilterOptions } from "@/lib/data-api";
import { DatasetFilters, FilterOptions } from "./dataset-filters";
import { GrowthCharts } from "./growth-charts";
import { DatasetListing } from "./dataset-listing";
import { DatasetStatsCards } from "./charts/dataset-stats-cards";
import { ActivityFeed } from "./charts/activity-feed";
import { DistributionChart } from "./charts/distribution-chart";
import { BarChartWrapper } from "./charts/bar-chart-wrapper";
import { DatasetDetailView } from "./charts/dataset-detail-view";

// Define fetch datasets parameters interface
interface FetchDatasetsParams extends FilterOptions {
  page: number;
}

// Define fetch result interface
interface FetchDatasetsResult {
  datasets: LegacyDataset[];
  totalPages: number;
}

// Define activity item interface
interface ActivityItem {
  id: string;
  action: string;
  user: string;
  dataset: string;
  timestamp: string;
}

// Mock data for distribution charts until API provides this
const mockModelDistribution: Record<string, number> = {
  "GPT-4": 45,
  "Claude": 30,
  "Llama-2": 25,
  "Mistral": 15,
  "Falcon": 10
};

const mockCategoryDistribution: Record<string, number> = {
  "Text": 50,
  "Image": 25,
  "Code": 15,
  "Audio": 10,
  "Multimodal": 5
};

// Mock activity data
const mockActivityData: ActivityItem[] = [
  { id: "1", action: "Created", user: "0x1234...", dataset: "GPT-4 Synthetic Q&A", timestamp: "2 hours ago" },
  { id: "2", action: "Downloaded", user: "0x5678...", dataset: "Technical Documentation Pairs", timestamp: "5 hours ago" },
  { id: "3", action: "Verified", user: "0xabcd...", dataset: "Multi-turn Dialogues", timestamp: "1 day ago" },
  { id: "4", action: "Created", user: "0x9876...", dataset: "Legal Contract Analysis", timestamp: "2 days ago" },
  { id: "5", action: "Downloaded", user: "0xef01...", dataset: "Educational Lessons", timestamp: "3 days ago" }
];

// Monthly data for charts
const monthlyData = [
  { month: "Jan", count: 5, cumulative: 5 },
  { month: "Feb", count: 8, cumulative: 13 },
  { month: "Mar", count: 12, cumulative: 25 },
  { month: "Apr", count: 10, cumulative: 35 },
  { month: "May", count: 15, cumulative: 50 },
  { month: "Jun", count: 20, cumulative: 70 },
  { month: "Jul", count: 18, cumulative: 88 }
];

export function MarketplaceAnalytics() {
  // State management
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Filter state management
  const [filterOptions, setFilterOptions] = useState({
    availableModels: [] as string[],
    availableCategories: [] as string[],
    availableOwners: [] as { id: string; name?: string }[],
  });
  
  const [filters, setFilters] = useState<FilterOptions>({});

  // Data fetching effect
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setStatsLoading(true);

        // Fetch filter options
        const options = await getAvailableFilterOptions([]);
        setFilterOptions(options);

        // Fetch datasets with current filters and pagination
        const params: FetchDatasetsParams = {
          page: currentPage,
          ...filters,
        };
        
        // Fetch datasets
        const result = await fetchDatasets(params);
        let fetchedDatasets: Dataset[] = [];
        let totalPagesCount = 1;

        if (result && typeof result === 'object') {
          if ('datasets' in result && 'totalPages' in result) {
            // Handle structured response
            const fetchResult = result as FetchDatasetsResult;
            fetchedDatasets = fetchResult.datasets.map((dataset: LegacyDataset) => 
              legacyToModernDataset(dataset)
            );
            totalPagesCount = fetchResult.totalPages;
          } else if (Array.isArray(result)) {
            // Handle array response
            fetchedDatasets = result.map((dataset: any) => 
              'version' in dataset ? dataset : legacyToModernDataset(dataset)
            );
          }
        }

        setDatasets(fetchedDatasets);
        setTotalPages(totalPagesCount);
        
        // Select first dataset if none selected
        if (fetchedDatasets.length > 0 && !selectedDataset) {
          setSelectedDataset(fetchedDatasets[0]);
        }
        
        // Fetch stats
        const statsResult = await fetchDatasetStats();
        setStats(statsResult);
      } catch (error) {
        toast.error("Failed to load analytics data");
        console.error(error);
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    };

    loadInitialData();
  }, [currentPage, filters, selectedDataset]);

  // Event handlers
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <DatasetFilters 
        // @ts-ignore
          options={filterOptions}
          onChange={handleFilterChange} 
          currentFilters={filters} 
        />
      </div>

      <Tabs 
        defaultValue="overview" 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="distributions">Distributions</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="details">Dataset Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Overview Stats Cards */}
          <DatasetStatsCards 
            stats={stats} 
            datasets={datasets} 
            isLoading={loading || statsLoading} 
          />
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Dataset List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Datasets</CardTitle>
                <CardDescription>
                  Browse and select datasets to view details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DatasetListing
                  datasets={datasets}
                  onSelectDataset={handleSelectDataset}
                  selectedDatasetId={selectedDataset?.id}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  loading={loading || statsLoading}
                />
              </CardContent>
            </Card>
            
            {/* Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest activity on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityFeed 
                  items={mockActivityData} 
                  isLoading={loading} 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="distributions" className="space-y-4">
          {/* Distribution charts grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DistributionChart
              title="Model Distribution"
              description="Distribution of datasets by model"
              distribution={mockModelDistribution}
              isLoading={loading}
            />
            
            <DistributionChart
              title="Category Distribution"
              description="Distribution of datasets by category"
              distribution={mockCategoryDistribution}
              isLoading={loading}
            />
          </div>
          
          {/* Performance charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BarChartWrapper
              title="Downloads by Model"
              description="Total downloads per model"
              data={Object.entries(mockModelDistribution).map(([name, value]) => ({ name, downloads: value * 10 }))}
              xAxisKey="name"
              barKey="downloads"
              barColor="#82ca9d"
              isLoading={loading}
            />
            
            <BarChartWrapper
              title="Dataset Size by Model"
              description="Average dataset size in MB"
              data={Object.entries(mockModelDistribution).map(([name, value]) => ({ 
                name, 
                size: Math.round(value * 12.5) 
              }))}
              xAxisKey="name"
              barKey="size"
              barColor="#8884d8"
              isLoading={loading}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="growth" className="space-y-4">
          {/* Growth charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BarChartWrapper
              title="Monthly Dataset Creation"
              description="Datasets created per month"
              data={monthlyData}
              xAxisKey="month"
              barKey="count"
              barColor="#8884d8"
              isLoading={loading}
            />
            
            <BarChartWrapper
              title="Cumulative Growth"
              description="Total datasets over time"
              data={monthlyData}
              xAxisKey="month"
              barKey="cumulative"
              barColor="#82ca9d"
              isLoading={loading}
            />
          </div>
          
          {/* User adoption chart */}
          <BarChartWrapper
            title="User Adoption"
            description="New creators joining the platform"
            data={[
              { month: "Jan", creators: 2 },
              { month: "Feb", creators: 3 },
              { month: "Mar", creators: 5 },
              { month: "Apr", creators: 4 },
              { month: "May", creators: 7 },
              { month: "Jun", creators: 9 },
              { month: "Jul", creators: 6 }
            ]}
            xAxisKey="month"
            barKey="creators"
            barColor="#ff8042"
            isLoading={loading}
          />
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          {selectedDataset ? (
            <DatasetDetailView dataset={selectedDataset} />
          ) : (
            <Card>
              <CardContent className="py-10">
                <div className="text-center text-muted-foreground">
                  No dataset selected. Please select a dataset from the overview tab.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
