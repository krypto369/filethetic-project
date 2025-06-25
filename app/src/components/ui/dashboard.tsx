import { useState, useEffect } from 'react';
import { useWagmiWeb3 } from '@/hooks/useWagmiWeb3';
import { Dataset } from '@/lib/types';
import { getAllDatasets, getWalletAddress } from '@/lib/web3';
import Link from 'next/link';

export function Dashboard() {
  const { account } = useWagmiWeb3();
  const [ownedDatasets, setOwnedDatasets] = useState<Dataset[]>([]);
  const [purchasedDatasets, setPurchasedDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!account) {
        setIsLoading(false);
        setError('Connect your wallet to view your dashboard');
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const allDatasets = await getAllDatasets();
        const address = await getWalletAddress();
        
        // Filter for owned and purchased datasets
        const owned = allDatasets.filter(dataset => 
          dataset.owner.toLowerCase() === address.toLowerCase()
        );
        
        // For purchased, we'd need to query each dataset for access rights
        // This is a simplified version - in production, you'd want to use batch queries
        const purchased = allDatasets.filter(dataset => 
          dataset.owner.toLowerCase() !== address.toLowerCase() && 
          dataset.numDownloads > 0 // Simplified check - should check actual access
        );
        
        setOwnedDatasets(owned);
        setPurchasedDatasets(purchased);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load your datasets');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [account]);

  if (!account) {
    return (
      <div className="p-6 bg-card rounded-lg shadow-md text-center">
        <h3 className="text-lg font-semibold mb-4">Connect Your Wallet</h3>
        <p className="text-muted-foreground">
          Please connect your wallet to view your dashboard
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-card rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Loading Dashboard</h3>
        <div className="flex justify-center">
          <div className="w-6 h-6 border-t-2 border-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/20 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p className="text-destructive-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-card rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Your Created Datasets</h3>
        {ownedDatasets.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {ownedDatasets.map(dataset => (
              <div key={dataset.id} className="p-4 border rounded-md flex justify-between items-center">
                <div>
                  <p className="font-medium">{dataset.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {dataset.isVerified ? '✓ Verified' : 'Not verified'} • {dataset.numDownloads} downloads
                  </p>
                </div>
                <div className="space-x-2">
                  <Link 
                    href={`/dataset/${dataset.id}`}
                    className="px-3 py-1 text-sm bg-secondary rounded hover:bg-secondary/80"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            You haven't created any datasets yet
          </p>
        )}
        <div className="mt-4 text-center">
          <Link
            href="/create"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80"
          >
            Create New Dataset
          </Link>
        </div>
      </div>

      <div className="p-6 bg-card rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Your Purchased Datasets</h3>
        {purchasedDatasets.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {purchasedDatasets.map(dataset => (
              <div key={dataset.id} className="p-4 border rounded-md flex justify-between items-center">
                <div>
                  <p className="font-medium">{dataset.name}</p>
                  <p className="text-sm text-muted-foreground">
                    By {dataset.owner.slice(0, 6)}...{dataset.owner.slice(-4)} • 
                    {dataset.isVerified ? ' ✓ Verified' : ' Not verified'}
                  </p>
                </div>
                <div className="space-x-2">
                  <Link 
                    href={`/dataset/${dataset.id}`}
                    className="px-3 py-1 text-sm bg-secondary rounded hover:bg-secondary/80"
                  >
                    View
                  </Link>
                  <button 
                    className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/80"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            You haven't purchased any datasets yet
          </p>
        )}
        <div className="mt-4 text-center">
          <Link
            href="/marketplace"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
