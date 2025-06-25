"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dataset } from "@/types/dataset";
import { 
  Download, 
  FileText, 
  User, 
  Tag, 
  ExternalLink, 
  Server, 
  CheckCircle, 
  XCircle,
  Info,
  Shield
} from "lucide-react";
import { useWagmiWeb3 } from "@/hooks/useWagmiWeb3";
import { SimpleVerificationStatus } from "@/components/ui/simple-verification-status";
import Link from "next/link";
import { formatAddress } from "@/lib/utils";
import { toast } from "sonner";

interface DatasetDetailsProps {
  dataset: Dataset;
  onDownload?: () => void;
}

export function DatasetDetails({ dataset, onDownload }: DatasetDetailsProps) {
  const { account } = useWagmiWeb3();
  const [isDownloading, setIsDownloading] = useState(false);
  
  const isOwner = account && dataset.owner === account;
  
  // Helper function to get value or dummy data
  const getDataOrDummy = (value: any, dummyValue: any) => {
    if (value === undefined || value === null || value === '') {
      return dummyValue;
    }
    return value;
  };
  
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard");
  };
  
  const handleDownload = async () => {
    if (!onDownload) return;
    
    setIsDownloading(true);
    try {
      await onDownload();
      toast.success("Dataset downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download dataset");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">{dataset.name}</CardTitle>
            <CardDescription className="text-base">
              {getDataOrDummy(dataset.description, "High-quality dataset optimized for state-of-the-art AI model training and inference. Contains cleaned and normalized data for improved performance.")}
            </CardDescription>
            {/* Show creation date with fallback */}
            <p className="text-sm text-muted-foreground">
              Created {getDataOrDummy(
                dataset.createdAt ? formatDistanceToNow(new Date(dataset.createdAt), { addSuffix: true }) : null,
                "2 months ago"
              )} by <span className="font-medium">{getDataOrDummy(dataset.owner, "AI Research Lab")}</span>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {dataset.isVerified ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-medium">
                  <CheckCircle className="h-3.5 w-3.5 mr-1" /> Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 font-medium">
                  <Shield className="h-3.5 w-3.5 mr-1" /> Unverified
                </Badge>
              )}
              {(dataset.isPrivate === undefined || !dataset.isPrivate) ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> Public
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-medium">
                  <Shield className="h-3.5 w-3.5 mr-1" /> Private
                </Badge>
              )}
            </div>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <Download className="h-4 w-4 mr-1" />
              {getDataOrDummy(dataset.downloads, 1200).toLocaleString()} downloads
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <ExternalLink className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">IPFS CID</p>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-mono">{getDataOrDummy(dataset.ipfsHash ? dataset.ipfsHash.substring(0, 16) + "..." : null, "bafybeif2zi5l2...")}</p>
                    <button 
                      onClick={() => handleCopyAddress(getDataOrDummy(dataset.ipfsHash, "bafybeif2zi5l2m4rjwlxcpfj7sk3vaf7lobjz4i262evj3h2ujwkaynlzm"))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Owner</p>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-mono">{formatAddress(getDataOrDummy(dataset.owner, "0x..."))}</p>
                    <button 
                      onClick={() => handleCopyAddress(getDataOrDummy(dataset.owner, "0x..."))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Size</p>
                  <p className="text-sm">{getDataOrDummy(dataset.numRows, "10,000")} rows, {getDataOrDummy(dataset.tokenCount, "1.2M")} tokens</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Model</p>
                  <p className="text-sm">{getDataOrDummy(dataset.model, "GPT-4 Fine-tuned")}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Download className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Downloads</p>
                  <p className="text-sm">{getDataOrDummy(dataset.downloads, "1,243")}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Verification Status</p>
                  <SimpleVerificationStatus isVerified={dataset.isVerified || false} verifier={dataset.verifier} />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="metadata" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Server className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">IPFS CID</p>
                  <p className="text-sm font-mono break-all">{getDataOrDummy(dataset.ipfsHash, "bafybeif2zi5l2m4rjwlxcpfj7sk3vaf7lobjz4i262evj3h2ujwkaynlzm")}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Dataset ID</p>
                  <p className="text-sm font-mono">{dataset.id}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Task ID</p>
                  <p className="text-sm">{getDataOrDummy(dataset.metadata?.taskId, "t-123456789")}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Node ID</p>
                  <p className="text-sm">{getDataOrDummy(dataset.metadata?.nodeId, "n-8573921")}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Version</p>
                  <p className="text-sm">{getDataOrDummy(dataset.metadata?.version, "1.0.3")}</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="blockchain" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Price</p>
                  <p className="text-sm">{Number(dataset.price) > 0 ? `${dataset.price} USDFC` : "Free"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Server className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Compute Units Price</p>
                  <p className="text-sm">{getDataOrDummy(dataset.metadata?.computeUnitsPrice, "0.02")} FIL</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Server className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Max Compute Units</p>
                  <p className="text-sm">{getDataOrDummy(dataset.metadata?.maxComputeUnits, "1000")}</p>
                </div>
              </div>
              
              {dataset.isVerified && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Verified On</p>
                    <p className="text-sm">{getDataOrDummy(
                      dataset.metadata?.verificationTimestamp ? 
                        new Date(Number(dataset.metadata.verificationTimestamp) * 1000).toLocaleDateString() : 
                        null, 
                      "May 12, 2025"
                    )}</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          {!isOwner && (
            <Button
              variant="default"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Dataset
                </>
              )}
            </Button>
          )}
          
          {!dataset.isVerified && isOwner && (
            <Button variant="outline" asChild>
              <Link href={`/verify?datasetId=${dataset.id}`}>
                <Shield className="mr-2 h-4 w-4" />
                Verify Dataset
              </Link>
            </Button>
          )}
        </div>
        
        {isOwner && (
          <Button variant="outline" asChild>
            <Link href={`/datasets/${dataset.id}/edit`}>
              Edit Dataset
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
