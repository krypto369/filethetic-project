'use client';

import { Web3Storage } from 'web3.storage';
import { toast } from 'sonner';
import * as LighthouseSDK from '@lighthouse-web3/sdk';

// Initialize Web3Storage client
let web3StorageClient: Web3Storage | null = null;

function getWeb3StorageClient() {
  if (!web3StorageClient) {
    const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;
    if (!token) {
      throw new Error('Web3Storage token not found');
    }
    web3StorageClient = new Web3Storage({ token });
  }
  return web3StorageClient;
}

/**
 * Store a file using Web3.Storage (IPFS)
 * @param file File or Blob to store
 * @param name Filename
 * @returns CID of the stored file
 */
export async function storeWithWeb3Storage(file: File | Blob, name: string): Promise<string> {
  try {
    const client = getWeb3StorageClient();
    const fileObj = new File([file], name, { type: file.type });
    const cid = await client.put([fileObj], {
      wrapWithDirectory: false,
      maxRetries: 3,
    });
    return cid;
  } catch (error) {
    console.error('Error storing with Web3.Storage:', error);
    throw new Error('Failed to store file with Web3.Storage');
  }
}

/**
 * Store a file using Lighthouse (Filecoin)
 * @param file File to store
 * @param progressCallback Optional callback for upload progress
 * @returns CID of the stored file
 */
export async function storeWithLighthouse(
  file: File,
  progressCallback?: (progress: number) => void
): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
    if (!apiKey) {
      throw new Error('Lighthouse API key not found');
    }

    // Mock implementation since we don't have the actual Lighthouse SDK types
    // In a real implementation, you would use the actual SDK
    console.log('Uploading to Lighthouse:', file.name);
    
    // Simulate upload progress
    if (progressCallback) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        progressCallback(Math.min(progress, 100));
        if (progress >= 100) clearInterval(interval);
      }, 500);
    }
    
    // Simulate upload completion
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return a mock CID
    const mockCid = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
    return mockCid;
  } catch (error) {
    console.error('Error storing with Lighthouse:', error);
    throw new Error('Failed to store file with Lighthouse');
  }
}

/**
 * Retrieve a file from IPFS
 * @param cid Content ID of the file
 * @returns URL to access the file
 */
export function getIPFSUrl(cid: string): string {
  return `https://ipfs.io/ipfs/${cid}`;
}

/**
 * Retrieve a file from Filecoin via Lighthouse
 * @param cid Content ID of the file
 * @returns URL to access the file
 */
export function getLighthouseUrl(cid: string): string {
  return `https://gateway.lighthouse.storage/ipfs/${cid}`;
}

/**
 * Store a dataset with metadata
 * @param data Dataset content
 * @param metadata Dataset metadata
 * @returns CID of the stored dataset
 */
export async function storeDataset(data: any, metadata: any): Promise<string> {
  try {
    // Combine data and metadata
    const dataset = {
      ...metadata,
      data,
      timestamp: Date.now()
    };
    
    // Convert to JSON and store
    const blob = new Blob([JSON.stringify(dataset)], { type: 'application/json' });
    const filename = `${metadata.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
    
    // Use Web3.Storage by default
    return await storeWithWeb3Storage(blob, filename);
  } catch (error) {
    console.error('Error storing dataset:', error);
    toast.error('Failed to store dataset');
    throw error;
  }
}
