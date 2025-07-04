'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import { createDataset, lockDataset } from '@/lib/web3';
import { GenerationResult } from '@/lib/models';

interface UseDatasetPublisherProps {
  name: string;
  description: string;
  price: string;
  visibility: 'public' | 'private';
  modelId: string;
  generatedData: GenerationResult[] | null;
  commp: string | null;
  onSuccess?: () => void;
}

export function useDatasetPublisher() {
  const { address } = useAccount();
  const [isPublishing, setIsPublishing] = useState(false);

  const publish = async (props: UseDatasetPublisherProps) => {
    if (!props.commp || !address || !props.generatedData) {
      return;
    }

    setIsPublishing(true);
    toast.info("Publishing dataset to the blockchain...");

    try {
      const priceInWei = ethers.parseUnits(props.price, 6).toString();
      
      // Debug logs to track parameters
      console.log('Publishing dataset with parameters:', {
        name: props.name,
        description: props.description,
        price: priceInWei,
        isPublic: props.visibility !== 'private',
        modelId: props.modelId,
        taskId: 1,
        nodeId: 1,
        computeUnitsPrice: 100,
        maxComputeUnits: 1000000
      });

      const { datasetId } = await createDataset(
        props.name,
        props.description,
        priceInWei,
        props.visibility !== 'private',
        props.modelId,
        1, // taskId (default)
        1, // nodeId (default)
        100, // computeUnitsPrice (default)
        1000000 // maxComputeUnits (default)
      );

      if (datasetId) {
        toast.info(`Dataset created with ID: ${datasetId}. Locking with Filecoin CommP...`);
        const totalTokens = props.generatedData.reduce((acc, item) => acc + item.usage.totalTokens, 0);
        await lockDataset(
          datasetId,
          props.commp,
          props.generatedData.length,
          totalTokens
        );
        toast.success('Dataset published and locked successfully!');
        if (props.onSuccess) {
          props.onSuccess();
        }
      } else {
        throw new Error("Failed to create dataset on-chain.");
      }
    } catch (error) {
      console.error('Error publishing dataset:', error);
      toast.error(`Failed to publish dataset: ${(error as Error).message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return { isPublishing, publish };
}
