'use client';

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Synapse } from "@filoz/synapse-sdk";
import { useEthersSigner } from "@/hooks/storage/useEthers";
import { useConfetti } from "@/hooks/storage/useConfetti";
import { useAccount } from "wagmi";
import { useNetwork } from "@/hooks/storage/useNetwork";
import { preflightCheck } from "@/utils/preflightCheck";
import { getProofset } from "@/utils/getProofset";
import { config } from "@/config/storageConfig";

export type UploadedInfo = {
  fileName?: string;
  fileSize?: number;
  commp?: string;
  txHash?: string;
};

/**
 * Hook to upload a data blob to the Filecoin network using Synapse.
 */
export const useDataUpload = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [uploadedInfo, setUploadedInfo] = useState<UploadedInfo | null>(null);

  const signer = useEthersSigner();
  const { triggerConfetti  } = useConfetti();
  const { address, chainId } = useAccount();
  const { data: network } = useNetwork();
  const mutation = useMutation({
    mutationKey: ["data-upload", address, chainId],
    mutationFn: async (data: any) => {
      if (!signer) throw new Error("Signer not found");
      if (!address) throw new Error("Address not found");
      if (!chainId) throw new Error("Chain ID not found");
      if (!network) throw new Error("Network not found");
      setProgress(0);
      setUploadedInfo(null);
      setStatus("🔄 Initializing data upload to Filecoin...");

      const file = new File([JSON.stringify(data, null, 2)], "dataset.json", { type: 'application/json' });
      const arrayBuffer = await file.arrayBuffer();
      const uint8ArrayBytes = new Uint8Array(arrayBuffer);

      const synapse = await Synapse.create({
        provider: signer.provider as any,
        disableNonceManager: false,
        withCDN: config.withCDN,
      });

      const { providerId } = await getProofset(signer, network, address);
      const withProofset = !!providerId;

      setStatus("💰 Checking USDFC balance and storage allowances...");
      setProgress(5);
      await preflightCheck(
        file,
        synapse,
        network,
        withProofset,
        setStatus,
        setProgress
      );

      setStatus("🔗 Setting up storage service and proof set...");
      setProgress(25);

      const storageService = await synapse.createStorage({
        providerId,
        callbacks: {
          onProofSetResolved: (info) => {
            console.log("Proof set resolved:", info);
            setStatus("🔗 Existing proof set found and resolved");
            setProgress(30);
          },
          onProofSetCreationStarted: (transactionResponse, statusUrl) => {
            console.log("Proof set creation started:", transactionResponse);
            console.log("Proof set creation status URL:", statusUrl);
            setStatus("🏗️ Creating new proof set on blockchain...");
            setProgress(35);
          },
          onProofSetCreationProgress: (status) => {
            console.log("Proof set creation progress:", status);
            if (status.transactionSuccess) {
              setStatus(`⛓️ Proof set transaction confirmed on chain`);
              setProgress(45);
            }
            if (status.serverConfirmed) {
              setStatus(
                `🎉 Proof set ready! (${Math.round(status.elapsedMs / 1000)}s)`
              );
              setProgress(50);
            }
          },
          onProviderSelected: (provider) => {
            console.log("Storage provider selected:", provider);
            setStatus(`🏪 Storage provider selected`);
          },
        },
      });

      setStatus("📁 Uploading data to storage provider...");
      setProgress(55);
      const { commp } = await storageService.upload(uint8ArrayBytes, {
        onUploadComplete: (commp) => {
          setStatus(
            `📊 Data uploaded! Signing msg to add roots to the proof set`
          );
          setUploadedInfo((prev) => ({
            ...prev,
            fileSize: file.size,
            commp: commp.toString(),
          }));
          setProgress(80);
        },
        onRootAdded: async (transactionResponse) => {
          setStatus(
            `🔄 Waiting for transaction to be confirmed on chain${
              transactionResponse ? `(txHash: ${transactionResponse.hash})` : ""
            }`
          );
          if (transactionResponse) {
            const receipt = await transactionResponse.wait();
            console.log("Receipt:", receipt);
            setUploadedInfo((prev) => ({
              ...prev,
              txHash: transactionResponse?.hash,
            }));
          }
          setStatus(`🔄 Waiting for storage provider confirmation`);
          setProgress(85);
        },
        onRootConfirmed: (rootIds) => {
          setStatus("🌳 Data roots added to proof set successfully");
          setProgress(90);
        },
      });

      if (!uploadedInfo?.txHash) {
        await new Promise((resolve) => setTimeout(resolve, 50000));
      }

      setProgress(95);
      setUploadedInfo((prev) => ({
        ...prev,
        fileSize: file.size,
        commp: commp.toString(),
      }));
    },
    onSuccess: () => {
      setStatus("🎉 Data successfully stored on Filecoin!");
      setProgress(100);
      triggerConfetti();
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      setStatus(`❌ Upload failed: ${error.message || "Please try again"}`);
      setProgress(0);
    },
  });

  const handleReset = () => {
    setProgress(0);
    setUploadedInfo(null);
    setStatus("");
  };

  return {
    uploadDataMutation: mutation,
    progress,
    uploadedInfo,
    handleReset,
    status,
  };
};
