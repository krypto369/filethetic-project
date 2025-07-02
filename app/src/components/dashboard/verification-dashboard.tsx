"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerificationStatus } from "@/components/ui/verification-status";
import { getAllDatasets, getDatasetVerificationInfo } from "@/lib/web3";
import { Dataset } from "@/lib/types";
import { Loader2, Search, Filter, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

export function VerificationDashboard() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [verifierStatus, setVerifierStatus] = useState<boolean | null>(null);
  const [verifierStatusLoading, setVerifierStatusLoading] = useState(false);

  // Fetch all datasets
  useEffect(() => {
    async function fetchDatasets() {
      try {
        setLoading(true);
        const allDatasets = await getAllDatasets();
        setDatasets(allDatasets);
        setFilteredDatasets(allDatasets);
      } catch (error) {
        console.error("Error fetching datasets:", error);
        toast.error("Failed to load datasets");
      } finally {
        setLoading(false);
      }
    }

    fetchDatasets();
  }, []);

  // Check if current user is a verifier
  useEffect(() => {
    async function checkVerifierStatus() {
      if (!isConnected || !address) {
        setVerifierStatus(false);
        return;
      }

      try {
        setVerifierStatusLoading(true);
        // This would be replaced with an actual contract call to check verifier status
        // For now, we'll simulate it with a timeout
        setTimeout(() => {
          // For demo purposes, let's assume the connected wallet is a verifier
          setVerifierStatus(true);
          setVerifierStatusLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error checking verifier status:", error);
        setVerifierStatus(false);
        setVerifierStatusLoading(false);
      }
    }

    checkVerifierStatus();
  }, [isConnected, address]);

  // Filter datasets based on search term and active tab
  useEffect(() => {
    if (!datasets.length) return;

    let filtered = [...datasets];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        dataset => 
          dataset.name.toLowerCase().includes(term) || 
          dataset.description.toLowerCase().includes(term)
      );
    }

    // Apply tab filter
    if (activeTab === "verified") {
      filtered = filtered.filter(dataset => dataset.isVerified);
    } else if (activeTab === "unverified") {
      filtered = filtered.filter(dataset => !dataset.isVerified);
    }

    setFilteredDatasets(filtered);
  }, [searchTerm, activeTab, datasets]);

  const handleVerifyClick = (datasetId: number) => {
    router.push(`/verify?datasetId=${datasetId}`);
  };

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>
            Please connect your wallet to view and verify datasets
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {verifierStatus && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Shield className="h-5 w-5" />
              Verifier Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700 dark:text-green-400">
              You have verifier privileges. You can verify datasets on the Filethetic platform.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search datasets..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Datasets</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="unverified">Unverified</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredDatasets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No datasets found</p>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDatasets.map((dataset) => (
            <Card key={dataset.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="truncate">{dataset.name}</CardTitle>
                <CardDescription>
                  ID: {dataset.id} • {dataset.numRows} rows
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {dataset.description}
                </p>
                <VerificationStatus 
                  datasetId={dataset.id} 
                  onVerifyClick={verifierStatus ? () => handleVerifyClick(dataset.id) : undefined}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/datasets/${dataset.id}`)}
                >
                  View Details
                </Button>
                {verifierStatus && !dataset.isVerified && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleVerifyClick(dataset.id)}
                  >
                    Verify
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
