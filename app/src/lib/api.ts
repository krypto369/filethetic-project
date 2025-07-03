import { Dataset } from "@/types/dataset";
import { toast } from "sonner";
import { mockDatasets } from "./mock-data";

// Function to get a dataset by ID
export async function getDatasetById(id: string): Promise<Dataset | null> {
  try {
    // In a real app, this would fetch from an API or blockchain
    // For now, we'll use mock data
    const dataset = mockDatasets.find(dataset => dataset.id === id);
    
    if (!dataset) {
      toast.error("Dataset not found");
      return null;
    }
    
    return dataset;
  } catch (error) {
    console.error("Error fetching dataset:", error);
    toast.error("Failed to load dataset");
    return null;
  }
}

// Function to get all datasets
export async function getDatasets(): Promise<Dataset[]> {
  try {
    // In a real app, this would fetch from an API or blockchain
    return mockDatasets;
  } catch (error) {
    console.error("Error fetching datasets:", error);
    toast.error("Failed to load datasets");
    return [];
  }
}
