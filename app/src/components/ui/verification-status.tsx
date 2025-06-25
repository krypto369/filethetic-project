"use client";

import { useState, useEffect } from "react";
import { Shield, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getDatasetVerificationInfo } from "@/lib/web3";
import { VerificationInfo } from "@/lib/types";
import { formatAddress } from "@/lib/utils";

interface VerificationStatusProps {
  datasetId: number;
  onVerifyClick?: () => void;
}

export function VerificationStatus({ datasetId, onVerifyClick }: VerificationStatusProps) {
  const [verificationInfo, setVerificationInfo] = useState<VerificationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVerificationStatus() {
      try {
        setLoading(true);
        setError(null);
        const info = await getDatasetVerificationInfo(datasetId);
        setVerificationInfo(info);
      } catch (err) {
        console.error("Error fetching verification status:", err);
        setError("Failed to load verification status");
      } finally {
        setLoading(false);
      }
    }

    if (datasetId) {
      fetchVerificationStatus();
    }
  }, [datasetId]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-500">
            <XCircle className="h-5 w-5" />
            Error Loading Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!verificationInfo) {
    return null;
  }

  if (verificationInfo.isVerified) {
    return (
      <Card className="border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            Verified Dataset
          </CardTitle>
          {verificationInfo.timestamp > 0 && (
            <CardDescription>
              Verified on {new Date(verificationInfo.timestamp * 1000).toLocaleDateString()}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            This dataset has been verified by{" "}
            <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
              {formatAddress(verificationInfo.verifier)}
            </span>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-yellow-500">
          <Clock className="h-5 w-5" />
          Unverified Dataset
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This dataset has not been verified yet. Verification ensures the authenticity and integrity of the dataset.
        </p>
        {onVerifyClick && (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onVerifyClick}
          >
            <Shield className="h-4 w-4" />
            Verify Dataset
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
