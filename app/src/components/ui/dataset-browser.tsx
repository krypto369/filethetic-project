"use client";

import { useEffect, useState, useCallback } from 'react';
import { getAllDatasets, lockDataset } from '@/lib/web3';
import { Dataset as DatasetType } from '@/lib/types';
import { DatasetCard } from '@/components/ui/dataset-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { useAccount } from 'wagmi';


// Local Dataset interface that matches what's used in the component
type Dataset = {
  id: number;
  name: string;
  description: string;
  price: string;
  owner: string;
  locked: boolean;
  verified: boolean;
  cid: string;
};

export function DatasetBrowser() {
  const { address, isConnected } = useAccount();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOwn, setFilterOwn] = useState(false);
  const [sortOption, setSortOption] = useState('newest');

  // Fetch all datasets from the blockchain
  const fetchDatasets = async () => {
    setIsLoading(true);
    try {
      const fetchedDatasets = await getAllDatasets();
      console.log("Fetched datasets from contract:", fetchedDatasets);
      // Transform the fetched datasets to match our local Dataset type
      const transformedDatasets = fetchedDatasets.map((dataset: DatasetType) => ({
        id: dataset.id,
        name: dataset.name,
        description: dataset.description,
        price: dataset.price,
        owner: dataset.owner,
        locked: dataset.cid !== '',  // If CID exists, consider it locked
        verified: dataset.isVerified || false,
        cid: dataset.cid
      }));
      console.log("Transformed datasets for display:", transformedDatasets);
      setDatasets(transformedDatasets);
      setFilteredDatasets(transformedDatasets);
    } catch (error) {
      console.error("Error fetching datasets:", error);
      toast.error("Error fetching datasets", {
        description: "Failed to fetch datasets. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dataset locking
  const handleLockDataset = async (id: number): Promise<void> => {
    try {
      // Mock values since we're not providing the actual lockDataset parameters in this UI
      // In a real implementation, these would come from the dataset or user input
      const cid = "mock-cid-for-now";  // This would be the actual IPFS CID
      const numRows = 1000;              // Example value
      const numTokens = 5000;            // Example value
      
      await lockDataset(id, cid, numRows, numTokens);
      
      // Update local state
      const updatedDatasets = datasets.map(dataset => 
        dataset.id === id ? { ...dataset, locked: true } : dataset
      );
      
      setDatasets(updatedDatasets);
      setFilteredDatasets(
        filterAndSortDatasets(
          updatedDatasets,
          searchTerm,
          filterOwn,
          sortOption
        )
      );
      
      toast.success("Dataset Locked", {
        description: "The dataset has been successfully locked and is now immutable.",
      });
    } catch (error: any) {
      console.error("Error locking dataset:", error);
      toast.error("Error locking dataset", {
        description: error.message || "Failed to lock dataset",
      });
    }
  };

  // Filter and sort datasets
  const filterAndSortDatasets = useCallback((
    datasetList: Dataset[],
    search: string,
    ownOnly: boolean,
    sort: string
  ) => {
    // Apply filters
    let filtered = datasetList.filter(dataset => {
      // Filter by search term
      const matchesSearch = 
        dataset.name.toLowerCase().includes(search.toLowerCase()) ||
        dataset.description.toLowerCase().includes(search.toLowerCase());
      
      // Filter by ownership if selected
      const matchesOwnership = ownOnly 
        ? address && dataset.owner.toLowerCase() === address.toLowerCase()
        : true;
      
      return matchesSearch && matchesOwnership;
    });
    
    // Apply sorting
    switch (sort) {
      case 'newest':
        // Assume newer datasets have higher IDs
        filtered.sort((a, b) => Number(b.id) - Number(a.id));
        break;
      case 'oldest':
        filtered.sort((a, b) => Number(a.id) - Number(b.id));
        break;
      case 'price-low':
        filtered.sort((a, b) => Number(BigInt(a.price) - BigInt(b.price)));
        break;
      case 'price-high':
        filtered.sort((a, b) => Number(BigInt(b.price) - BigInt(a.price)));
        break;
      default:
        break;
    }
    
    return filtered;
  }, [address]);

  // Handle filter changes
  useEffect(() => {
    if (datasets.length > 0) {
      const filtered = filterAndSortDatasets(
        datasets,
        searchTerm,
        filterOwn,
        sortOption
      );
      setFilteredDatasets(filtered);
    }
  }, [searchTerm, filterOwn, sortOption, address, datasets, filterAndSortDatasets]);

  // Initial fetch
  useEffect(() => {
    fetchDatasets();
  }, []);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search datasets..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setFilterOwn(!filterOwn)}
            className={filterOwn ? "bg-primary/10" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            {filterOwn ? "All Datasets" : "My Datasets"}
          </Button>
          
          <Select
            value={sortOption}
            onValueChange={setSortOption}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchDatasets}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading datasets...</div>
        </div>
      ) : filteredDatasets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDatasets.map((dataset) => (
            <DatasetCard
              key={dataset.id}
              id={dataset.id}
              name={dataset.name}
              description={dataset.description}
              price={dataset.price}
              owner={dataset.owner}
              locked={dataset.locked}
              verified={dataset.verified}
              cid={dataset.cid}
              isOwner={!!address && dataset.owner.toLowerCase() === address.toLowerCase()}
              onLock={handleLockDataset}
              onVerificationCheck={async () => Promise.resolve()}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center py-12 space-y-2 text-center">
          <p className="text-lg font-medium">No datasets found</p>
          <p className="text-muted-foreground">
            {searchTerm || filterOwn ? 
              "Try adjusting your filters or search terms" : 
              "Be the first to create a synthetic dataset!"
            }
          </p>
          {!searchTerm && !filterOwn && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.href = "/create"}
            >
              Create Dataset
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
