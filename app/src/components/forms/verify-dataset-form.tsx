"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyDataset, getDataset } from "@/lib/web3";
import { Shield, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from 'sonner';     
import { useAccount } from 'wagmi';
import Link from "next/link";
import { VerificationStatus } from "@/components/ui/verification-status";
import { Dataset } from "@/lib/types";

// Define form schema
const formSchema = z.object({
  datasetId: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: "Dataset ID must be a non-negative number",
  }),
  datasetHash: z.string().min(64, {
    message: "Dataset hash must be a valid hash (at least 64 characters)",
  }),
  signature: z.string().min(1, {
    message: "Signature is required",
  }),
});

export function VerifyDatasetForm() {
  const { isConnected } = useAccount();
  const searchParams = useSearchParams();
  const datasetIdParam = searchParams.get('datasetId');
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loadingDataset, setLoadingDataset] = useState(false);

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      datasetId: "",
      datasetHash: "",
      signature: "",
    },
  });
  
  // Load dataset details if ID is provided in URL
  useEffect(() => {
    async function loadDatasetDetails() {
      if (!datasetIdParam || !isConnected) return;
      
      try {
        setLoadingDataset(true);
        const datasetId = parseInt(datasetIdParam);
        const datasetDetails = await getDataset(datasetId);
        setDataset(datasetDetails);
        
        // Pre-fill the form with dataset ID
        form.setValue('datasetId', datasetIdParam);
      } catch (error) {
        console.error('Error loading dataset details:', error);
        toast.error('Failed to load dataset details');
      } finally {
        setLoadingDataset(false);
      }
    }
    
    loadDatasetDetails();
  }, [datasetIdParam, isConnected, form]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isConnected) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet to verify datasets"
      });
      return;
    }

    setIsVerifying(true);
    setVerified(false);

    try {
      const datasetId = parseInt(values.datasetId);
      const datasetHash = values.datasetHash;
      const signature = values.signature;

      // The verifier's address is the currently connected wallet
      const signerAddress = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Call the verification contract
      await verifyDataset(datasetId, datasetHash, signature, signerAddress[0]);

      setVerified(true);
      toast.success("Verification successful", {
        description: "The dataset has been successfully verified",
      });
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error("Verification failed", {
        description: error.message || "There was an error verifying the dataset",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Please connect your wallet to verify datasets
          </p>
        </CardContent>
      </Card>
    );
  }

  if (verified) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="flex flex-row items-center gap-2">
          <CheckCircle className="text-green-500 h-6 w-6" />
          <CardTitle>Dataset Verified</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              The dataset has been successfully verified on the blockchain
            </p>
            <div className="mt-6">
              {dataset && (
                <VerificationStatus datasetId={dataset.id} />
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button 
                variant="outline"
                onClick={() => {
                  setVerified(false);
                  form.reset();
                }}
              >
                Verify Another Dataset
              </Button>
              <Button asChild>
                <Link href="/verify/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {datasetIdParam && (
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/verify/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
            </Link>
          </Button>
        </div>
      )}
      
      {dataset && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{dataset.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground">{dataset.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Dataset ID</p>
                  <p className="text-sm text-muted-foreground">{dataset.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Rows</p>
                  <p className="text-sm text-muted-foreground">{dataset.numRows}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Model</p>
                  <p className="text-sm text-muted-foreground">{dataset.modelName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Created By</p>
                  <p className="text-sm font-mono text-muted-foreground truncate">{dataset.owner}</p>
                </div>
              </div>
              <VerificationStatus datasetId={dataset.id} />
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="flex flex-row items-center gap-2">
          <Shield className="h-6 w-6" />
          <CardTitle>Verify Dataset</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="datasetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dataset ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter dataset ID" 
                        {...field} 
                        disabled={!!dataset}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="datasetHash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dataset Hash</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter dataset hash" {...field} />
                    </FormControl>
                    <FormDescription>
                      The hash of the dataset to verify (keccak256 hash)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="signature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signature</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter verification signature" {...field} />
                    </FormControl>
                    <FormDescription>
                      Cryptographic signature for the dataset hash
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying ? "Verifying..." : "Verify Dataset"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
