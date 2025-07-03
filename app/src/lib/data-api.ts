import { Dataset, DatasetStats, ColumnStats } from "@/types/dataset";
import { Dataset as LegacyDataset } from "@/lib/types";
import { legacyToModernDataset, modernToLegacyDataset } from "@/lib/type-adapters";
import { FilterOptions } from "@/components/analytics/dataset-filters";
import { mockDatasets } from "@/lib/mock-data";

/**
 * Fetch datasets with optional filtering
 * @param filters Filter options to apply
 * @returns Filtered datasets
 */
export async function fetchDatasets(filters?: FilterOptions): Promise<Dataset[]> {
  try {
    // In a real application, this would call your API with filter parameters
    // For now, we'll use mock data
    
    // Mock delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Start with all datasets - use type adapter to convert from legacy to modern
    // mockDatasets is likely using the legacy format with number IDs
    let datasets: Dataset[] = mockDatasets.map(ds => legacyToModernDataset(ds as unknown as LegacyDataset));
    
    // Apply filters if provided
    if (filters) {
      // Filter by search term
      if (filters.search && filters.search.trim() !== "") {
        const searchTerm = filters.search.toLowerCase();
        datasets = datasets.filter((dataset: Dataset) => 
          dataset.name.toLowerCase().includes(searchTerm) ||
          (dataset.description?.toLowerCase().includes(searchTerm) || false)
        );
      }
      
      if (filters.status === "verified") {
        datasets = datasets.filter(dataset => dataset.isVerified === true);
      } else if (filters.status === "unverified") {
        datasets = datasets.filter(dataset => dataset.isVerified !== true);
      }
      
      if (filters.priceRange) {
        datasets = datasets.filter(
          dataset => 
            (dataset.price || 0) >= filters.priceRange![0] && 
            (dataset.price || 0) <= filters.priceRange![1]
        );
      }
      
      if (filters.models && filters.models.length > 0) {
        datasets = datasets.filter(
          dataset => dataset.model && filters.models!.includes(dataset.model)
        );
      }
      
      if (filters.categories && filters.categories.length > 0) {
        datasets = datasets.filter(
          dataset => 
            dataset.categories && 
            dataset.categories.some(category => filters.categories!.includes(category))
        );
      }
      
      if (filters.rowCountRange) {
        datasets = datasets.filter(
          dataset => 
            (dataset.numRows || 0) >= filters.rowCountRange![0] && 
            (dataset.numRows || 0) <= filters.rowCountRange![1]
        );
      }
      
      if (filters.tokenCountRange) {
        datasets = datasets.filter(
          dataset => 
            (dataset.tokenCount || 0) >= filters.tokenCountRange![0] && 
            (dataset.tokenCount || 0) <= filters.tokenCountRange![1]
        );
      }
      
      // Implement the sort
      const sortBy = filters.sortBy || "createdAt";
      const sortDirection = filters.sortDirection || "desc";
      
      datasets = datasets.sort((a, b) => {
        const aValue = a[sortBy as keyof Dataset];
        const bValue = b[sortBy as keyof Dataset];
        
        if (aValue === undefined || bValue === undefined) return 0;
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc" 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        // Handle dates
        if (aValue instanceof Date && bValue instanceof Date) {
          return sortDirection === "asc" 
            ? aValue.getTime() - bValue.getTime() 
            : bValue.getTime() - aValue.getTime();
        }
        
        // Handle numbers
        return sortDirection === "asc" 
          ? (aValue as number) - (bValue as number) 
          : (bValue as number) - (aValue as number);
      });
      
      // Implement "Show only mine" filter if user's address is provided
      if (filters.showOnlyMine) {
        // In a real app, you would get the user's address from the wallet connection
        const userAddress = "0x123..."; // Example user address
        datasets = datasets.filter(dataset => dataset.owner === userAddress);
      }
    }
    
    return datasets;
  } catch (error) {
    console.error("Error fetching datasets:", error);
    return [];
  }
}

/**
 * Fetch analytics statistics for datasets
 * @returns Dataset statistics
 */
export async function fetchDatasetStats(): Promise<DatasetStats> {
  try {
    // In a real application, this would call your API to get stats
    // For now, we'll calculate from mock data
    
    // Mock delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const datasets = MOCK_DATASETS;
    
    const totalCount = datasets.length;
    const verifiedCount = datasets.filter(d => d.isVerified).length;
    const publicCount = datasets.filter(d => !d.isPrivate).length;
    const privateCount = datasets.filter(d => d.isPrivate).length;
    const totalDownloads = datasets.reduce((sum, dataset) => sum + (dataset.downloads || 0), 0);
    
    // Calculate average price (excluding free datasets)
    const paidDatasets = datasets.filter(d => (d.price || 0) > 0);
    const averagePrice = paidDatasets.length > 0
      ? paidDatasets.reduce((sum, d) => sum + (d.price || 0), 0) / paidDatasets.length
      : 0;
    
    // Count models
    const modelCounts: Record<string, number> = {};
    datasets.forEach(dataset => {
      if (dataset.model) {
        modelCounts[dataset.model] = (modelCounts[dataset.model] || 0) + 1;
      }
    });
    
    const topModels = Object.entries(modelCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Count categories
    const categoryCounts: Record<string, number> = {};
    datasets.forEach(dataset => {
      if (dataset.categories) {
        dataset.categories.forEach(category => {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
      }
    });
    
    const topCategories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Calculate month-over-month growth
    const calculateMonthlyGrowth = (datasetsByMonth: { name: string; datasets: number }[]): number[] => {
      const growthRates: number[] = [];
      
      for (let i = 1; i < datasetsByMonth.length; i++) {
        const prevMonth = datasetsByMonth[i - 1].datasets;
        const currMonth = datasetsByMonth[i].datasets;
        
        // Calculate percentage growth
        // Handle case where previous month is 0
        const growthRate = prevMonth === 0 
          ? currMonth > 0 ? 100 : 0
          : ((currMonth - prevMonth) / prevMonth) * 100;
        
        growthRates.push(Number(growthRate.toFixed(1)));
      }
      
      return growthRates;
    };
    
    // Generate the last 6 months of data
    const generateLastSixMonths = (): { name: string; datasets: number }[] => {
      const months: Array<{ name: string; datasets: number }> = [];
      const currentDate = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(currentDate.getMonth() - i);
        
        const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d);
        
        months.push({
          name: monthName,
          datasets: Math.floor(Math.random() * 30) + 5 // Random number between 5 and 35
        });
      }
      
      return months;
    };
    
    // Convert the generated data to the expected format for growthByMonth
    const growthByMonth = generateLastSixMonths().map(item => ({ 
      month: item.name, 
      count: item.datasets 
    }));
    
    return {
      totalCount,
      verifiedCount,
      publicCount,
      privateCount,
      totalDownloads,
      averagePrice,
      topModels,
      topCategories,
      growthByMonth
    };
  } catch (error) {
    console.error("Error fetching dataset stats:", error);
    return {
      totalCount: 0,
      verifiedCount: 0,
      publicCount: 0,
      privateCount: 0,
      totalDownloads: 0,
      averagePrice: 0,
      topModels: [],
      topCategories: [],
      growthByMonth: [],
      // monthlyGrowthRates: []
    };
  }
}

/**
 * Get available filter options from datasets
 */
export function getAvailableFilterOptions(datasets: Dataset[]) {
  const models = new Set<string>();
  const categories = new Set<string>();
  const owners = new Set<{ id: string, name?: string }>();
  
  datasets.forEach(dataset => {
    if (dataset.model) models.add(dataset.model);
    
    if (dataset.categories) {
      dataset.categories.forEach(category => categories.add(category));
    }
    
    if (dataset.owner) {
      owners.add({ id: dataset.owner });
    }
  });
  
  return {
    availableModels: Array.from(models),
    availableCategories: Array.from(categories),
    availableOwners: Array.from(owners)
  };
}

// Mock datasets for development
const MOCK_DATASETS: Dataset[] = [
  {
    id: "1",
    name: "GPT-4 Synthetic Q&A",
    description: "High-quality Q&A pairs generated with GPT-4",
    owner: "0x1234567890123456789012345678901234567890",
    size: 2500000,
    numRows: 5000,
    numColumns: 3,
    tokenCount: 750000,
    model: "GPT-4",
    downloads: 245,
    createdAt: new Date(2025, 1, 10),
    price: 25,
    isVerified: true,
    categories: ["Q&A", "Instruction-tuning"],
    isPrivate: false
  },
  {
    id: "2",
    name: "Synthethic Code Explanations",
    description: "Dataset of code snippets with detailed explanations",
    owner: "0x2345678901234567890123456789012345678901",
    size: 5000000,
    numRows: 12000,
    numColumns: 4,
    tokenCount: 1500000,
    model: "Claude-3",
    downloads: 187,
    createdAt: new Date(2025, 3, 5),
    price: 50,
    isVerified: true,
    categories: ["Code", "Explanation"],
    isPrivate: false
  },
  {
    id: "3",
    name: "Technical Documentation Pairs",
    description: "API documentation with examples and explanations",
    owner: "0x3456789012345678901234567890123456789012",
    size: 1800000,
    numRows: 3500,
    numColumns: 5,
    tokenCount: 600000,
    model: "GPT-4",
    downloads: 134,
    createdAt: new Date(2025, 4, 20),
    price: 30,
    isVerified: false,
    categories: ["Documentation", "Technical"],
    isPrivate: false
  },
  {
    id: "4",
    name: "Multi-turn Dialogues",
    description: "Synthetic conversations with multiple turns",
    owner: "0x4567890123456789012345678901234567890123",
    size: 8000000,
    numRows: 20000,
    numColumns: 6,
    tokenCount: 2000000,
    model: "Claude-3",
    downloads: 312,
    createdAt: new Date(2025, 5, 8),
    price: 60,
    isVerified: true,
    categories: ["Conversation", "Dialogue"],
    isPrivate: true
  },
  {
    id: "5",
    name: "Financial QA Dataset",
    description: "Questions and answers about financial topics",
    owner: "0x5678901234567890123456789012345678901234",
    size: 1200000,
    numRows: 2500,
    numColumns: 3,
    tokenCount: 500000,
    model: "GPT-3.5",
    downloads: 98,
    createdAt: new Date(2025, 2, 15),
    price: 20,
    isVerified: false,
    categories: ["Finance", "Q&A"],
    isPrivate: false
  },
  {
    id: "6",
    name: "Medical Research Summaries",
    description: "Summaries of medical research papers",
    owner: "0x6789012345678901234567890123456789012345",
    size: 3000000,
    numRows: 8000,
    numColumns: 4,
    tokenCount: 900000,
    model: "Claude-3",
    downloads: 76,
    createdAt: new Date(2025, 5, 25),
    price: 40,
    isVerified: true,
    categories: ["Medical", "Research", "Summaries"],
    isPrivate: true
  },
  {
    id: "7",
    name: "Legal Contract Analysis",
    description: "Analysis and explanations of legal contracts",
    owner: "0x7890123456789012345678901234567890123456",
    size: 4500000,
    numRows: 7500,
    numColumns: 5,
    tokenCount: 1200000,
    model: "GPT-4",
    downloads: 125,
    createdAt: new Date(2025, 4, 2),
    price: 55,
    isVerified: false,
    categories: ["Legal", "Contracts"],
    isPrivate: true
  },
  {
    id: "8",
    name: "Educational Lessons",
    description: "Structured educational lessons with questions",
    owner: "0x8901234567890123456789012345678901234567",
    size: 6000000,
    numRows: 15000,
    numColumns: 4,
    tokenCount: 1800000,
    model: "Claude-3",
    downloads: 210,
    createdAt: new Date(2025, 3, 18),
    price: 35,
    isVerified: true,
    categories: ["Education", "Lessons"],
    isPrivate: false
  },
  {
    id: "9",
    name: "Creative Writing Prompts",
    description: "Creative writing prompts with responses",
    owner: "0x9012345678901234567890123456789012345678",
    size: 3800000,
    numRows: 9000,
    numColumns: 3,
    tokenCount: 1300000,
    model: "GPT-3.5",
    downloads: 89,
    createdAt: new Date(2025, 1, 28),
    price: 15,
    isVerified: false,
    categories: ["Creative", "Writing"],
    isPrivate: false
  },
  {
    id: "10",
    name: "Customer Service Interactions",
    description: "Synthetic customer service conversations",
    owner: "0x0123456789012345678901234567890123456789",
    size: 5500000,
    numRows: 12500,
    numColumns: 4,
    tokenCount: 1600000,
    model: "GPT-4",
    downloads: 155,
    createdAt: new Date(2025, 2, 5),
    price: 45,
    isVerified: true,
    categories: ["Customer Service", "Conversation"],
    isPrivate: false
  }
];
