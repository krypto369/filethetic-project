"use client";

import { useState } from 'react';
import { formatEther, formatUnits } from 'ethers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Unlock, ShoppingCart, Shield, CheckCircle, XCircle, Eye, EyeOff, Download } from 'lucide-react';
import { purchaseDataset, hasAccessToDataset, checkDatasetVerification } from '@/lib/web3';
import { getDatasetContent } from '@/lib/ipfs';
import { toast } from 'sonner';     
import { useAccount } from 'wagmi';

export interface DatasetCardProps {
  id: number;
  name: string;
  description?: string;
  price: string; // Price in wei
  owner: string;
  locked: boolean;
  verified?: boolean;
  isOwner: boolean;
  cid: string; // IPFS CID
  onLock?: (id: number) => Promise<void>;
  onVerificationCheck?: (id: number) => Promise<void>;
}

export function DatasetCard({
  id,
  name,
  description,
  price,
  owner,
  locked,
  verified,
  isOwner,
  cid,
  onLock,
  onVerificationCheck,
}: DatasetCardProps) {
  const { address, isConnected } = useAccount();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Format price from wei to USDFC (with 6 decimals)
  const parsedPrice = parseFloat(formatUnits(String(price || '0').split('.')[0], 12));
  // Show dummy price if price is 0
  const formattedPrice = parsedPrice === 0 ? "10.00" : parsedPrice.toFixed(2);

  const checkAccess = async () => {
    if (!isConnected || !address) return;
    setIsLoading(true);
    try {
      const hasAccess = await hasAccessToDataset(id, address);
      setHasAccess(hasAccess);
    } catch (error) {
      console.error("Error checking dataset access:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isConnected) return;
    setIsPurchasing(true);
    try {
      await purchaseDataset(id, price);
      await checkAccess();
    } catch (error) {
      console.error("Error purchasing dataset:", error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleLock = async () => {
    if (onLock) {
      await onLock(id);
    }
  };

  const handleVerificationCheck = async () => {
    if (onVerificationCheck) {
      await onVerificationCheck(id);
    }
  };
  
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const content = await getDatasetContent(cid);
      
      // Convert content to JSON string
      const jsonString = JSON.stringify(content, null, 2);
      
      // Create a blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dataset-${id}-${name}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading dataset:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{description || "Medical Reports Data"}</CardDescription>
          </div>
          <div className="flex gap-2">
            {locked ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Lock className="h-3 w-3" /> Locked
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <Unlock className="h-3 w-3" /> Unlocked
              </Badge>
            )}
            
            {verified !== undefined && (
              <Badge 
                variant={verified ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {verified ? (
                  <><CheckCircle className="h-3 w-3" /> Verified</>
                ) : (
                  <><XCircle className="h-3 w-3" /> Unverified</>
                )}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Price:</span>
            <span className="font-medium">{formattedPrice} USDFC</span>
          </div>
          
          {hasAccess === null && isConnected && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="mt-2"
              onClick={checkAccess}
              disabled={isLoading}
            >
              {isLoading ? "Checking..." : "Check Access"}
            </Button>
          )}
          
          {hasAccess === true && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 gap-1"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download Dataset"}
            </Button>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          {isOwner && !locked && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLock}
            >
              <Lock className="h-4 w-4 mr-2" />
              Lock Dataset
            </Button>
          )}
          
          {isOwner && verified === false && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerificationCheck}
            >
              <Shield className="h-4 w-4 mr-2" />
              Verify
            </Button>
          )}
        </div>
        
        {!isOwner && !hasAccess && (
          <Button 
            onClick={handlePurchase} 
            disabled={isPurchasing || !locked}
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isPurchasing ? "Processing..." : "Purchase"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
