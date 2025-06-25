"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDatasetById } from "@/lib/api";
import { useWagmiWeb3 } from "@/hooks/useWagmiWeb3";
import { DatasetDetails } from "@/components/ui/dataset-details";
import { EnhancedDatasetViewer } from "@/components/ui/enhanced-dataset-viewer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dataset } from "@/types/dataset";
import { legacyToModernDataset, modernToLegacyDataset } from "@/lib/type-adapters";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { decryptDataset } from "@/lib/utils";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DatasetPage() {
  const params = useParams();
  const router = useRouter();
  const { account, isConnected } = useWagmiWeb3();
  const id = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [datasetContent, setDatasetContent] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [decrypting, setDecrypting] = useState(false);
  const isLargeScreen = window.innerWidth > 1024;
  
  useEffect(() => {
    async function fetchDataset() {
      setLoading(true);
      setError(null);
      
      try {
        if (!id) {
          setError("Missing dataset ID");
          return;
        }
        
        const fetchedDataset = await getDatasetById(id);
        setDataset(fetchedDataset);
        
        // @ts-ignore
        if (fetchedDataset?.isPublic) {
          await loadDatasetContent(fetchedDataset);
        }
      } catch (err) {
        console.error("Error fetching dataset:", err);
        setError("Failed to load dataset details");
      } finally {
        setLoading(false);
      }
    }
    
    fetchDataset();
  }, [id]);
  
  const loadDatasetContent = async (targetDataset: Dataset) => {
    const ipfsHash = targetDataset.metadata?.ipfsHash;
    if (!ipfsHash) {
      toast.error("Dataset CID is missing");
      return;
    }
    
    setDecrypting(true);
    try {
      // Fetch and decrypt dataset content
      // Convert legacy dataset format to modern format if needed
      const modernDataset = targetDataset.hasOwnProperty('version') ? legacyToModernDataset(targetDataset as any) : targetDataset;
      const content = await decryptDataset(modernDataset);
      setDatasetContent(Array.isArray(content) ? content : []);
      toast.success("Dataset loaded successfully");
    } catch (err) {
      console.error("Error loading dataset content:", err);
      toast.error("Failed to load dataset content");
      setError("Failed to load dataset content");
    } finally {
      setDecrypting(false);
    }
  };
  
  const onDownload = async () => {
    if (!dataset) return;

    return new Promise<void>((resolve, reject) => {
      // In a real app, implement download from IPFS using the CID
      // Access the IPFS hash from metadata
      const ipfsHash = dataset.metadata?.ipfsHash;
      console.log(`Downloading dataset with IPFS hash: ${ipfsHash}`);
      
      // Simulate download delay
      setTimeout(() => {
        resolve();
      }, 1500);
    });
  };

  if (loading) {
    return (
      <div className="container max-w-7xl py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }
  
  if (error || !dataset) {
    return (
      <div className="container max-w-7xl py-6 space-y-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/datasets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "Dataset not found"}. 
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="/datasets">Return to datasets list</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const needsWalletConnection = !isConnected && dataset.isPrivate !== false;
  const isOwner = account && dataset.owner === account;
  
  return (
    <div className="container max-w-7xl py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/datasets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Dataset Details</h1>
      </div>
      
      <div className={isLargeScreen ? "grid grid-cols-3 gap-6" : "space-y-6"}>
        <div className={isLargeScreen ? "col-span-1" : ""}>
          <ScrollArea className={isLargeScreen ? "h-[calc(100vh-200px)]" : "h-auto"}>
            <DatasetDetails 
              dataset={dataset as any}
              onDownload={onDownload}
            />
          </ScrollArea>
        </div>
        
        <div className={isLargeScreen ? "col-span-2" : ""}>
          {needsWalletConnection ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Private Dataset</AlertTitle>
              <AlertDescription>
                Please connect your wallet to view this dataset.
              </AlertDescription>
            </Alert>
          ) : decrypting ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-4">
              <div className="flex flex-col items-center space-y-2">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <div className="absolute h-12 w-12 rounded-full border-4 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
                </div>
                <div className="text-xl font-semibold">Decrypting Dataset</div>
                <p className="text-sm text-muted-foreground">
                  Verified by: {dataset.metadata?.verifier ? dataset.metadata.verifier : "Not verified"}
                </p>
              </div>
            </div>
          ) : datasetContent.length > 0 ? (
            <EnhancedDatasetViewer 
              data={datasetContent}
              metadata={{
                verified: dataset.metadata?.isVerified,
                verifier: dataset.metadata?.verifier,
                name: dataset.metadata?.name,
                description: dataset.metadata?.description
              }}
              downloadable={true}
            />
          ) : (
            <div className="p-12 flex flex-col items-center justify-center space-y-4">
              {dataset.metadata?.isPublic ? (
                <>
                  <AlertCircle className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Failed to load dataset content</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      There was a problem loading this dataset. Please try again later.
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => loadDatasetContent(dataset)}
                    >
                      Retry
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Private Dataset</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isOwner ? 
                        "Click the button below to decrypt and view your dataset." : 
                        "This dataset is private. You need to purchase it to view its contents."}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-auto"
                      disabled={dataset.isPrivate === true}
                      onClick={() => loadDatasetContent(dataset)}
                    >
                      {dataset.isPrivate === true ? "Private Dataset" : "View Data"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
