import { Web3Storage } from 'web3.storage';
import { Lighthouse } from '@lighthouse-web3/sdk';
import { getEnv } from '@/env.mjs';

/**
 * IPFS/Filecoin storage integration for Filethetic
 * Provides functionality for storing and retrieving datasets using IPFS and Filecoin
 */

// Initialize the Web3Storage client
let web3StorageClient: Web3Storage | null = null;

/**
 * Initialize the Web3Storage client
 * @returns Web3Storage client instance
 */
export function getWeb3StorageClient(): Web3Storage {
  if (!web3StorageClient) {
    const token = getEnv('NEXT_PUBLIC_WEB3STORAGE_TOKEN');
    if (!token) {
      throw new Error('WEB3STORAGE_TOKEN is not defined');
    }
    web3StorageClient = new Web3Storage({ token });
  }
  return web3StorageClient;
}

/**
 * Store a dataset on IPFS with Web3.Storage
 * @param dataset The dataset content
 * @param metadata Additional metadata
 * @returns CID of the stored content
 */
export async function storeDataset(
  dataset: Record<string, any>,
  metadata: Record<string, any>
): Promise<string> {
  const client = getWeb3StorageClient();

  // Prepare the files
  const datasetBlob = new Blob([JSON.stringify(dataset)], {
    type: 'application/json',
  });
  const metadataBlob = new Blob([JSON.stringify(metadata)], {
    type: 'application/json',
  });

  const files = [
    new File([datasetBlob], 'dataset.json'),
    new File([metadataBlob], 'metadata.json'),
  ];

  // Upload to IPFS via Web3.Storage (which also ensures Filecoin storage)
  const cid = await client.put(files, {
    name: `filethetic-${metadata.name || 'dataset'}-${Date.now()}`,
    wrapWithDirectory: true,
  });

  return cid;
}

/**
 * Retrieve a dataset from IPFS using its CID
 * @param cid Content identifier for the dataset
 * @returns The retrieved dataset
 */
export async function retrieveDataset(cid: string): Promise<{
  dataset: Record<string, any>;
  metadata: Record<string, any>;
}> {
  const client = getWeb3StorageClient();
  const res = await client.get(cid);

  if (!res?.ok) {
    throw new Error(`Failed to retrieve dataset with CID ${cid}`);
  }

  const files = await res.files();
  
  let dataset = {};
  let metadata = {};
  
  for (const file of files) {
    if (file.name === 'dataset.json') {
      const content = await file.text();
      dataset = JSON.parse(content);
    } else if (file.name === 'metadata.json') {
      const content = await file.text();
      metadata = JSON.parse(content);
    }
  }

  return { dataset, metadata };
}

/**
 * Create a Filecoin storage deal using Lighthouse
 * @param cid The CID of the content to store
 * @param apiKey Lighthouse API key
 * @returns Deal information
 */
export async function createFilecoinDeal(
  cid: string,
  apiKey: string
): Promise<any> {
  try {
    const dealParams = {
      cid: cid,
      network: 'calibration', // or 'mainnet'
      dealDuration: 525600, // 1 year in minutes
      numOfCopies: 2,
    };

    const response = await Lighthouse.dealStatus(apiKey, dealParams);
    return response;
  } catch (error) {
    console.error('Error creating Filecoin deal:', error);
    throw error;
  }
}

/**
 * Encrypt a dataset with access control based on EVM address
 * @param file The file to encrypt
 * @param accessControlConditions Access control conditions based on blockchain addresses
 * @returns Encrypted file information
 */
export async function encryptDataset(
  file: File,
  accessControlConditions: any[]
): Promise<any> {
  try {
    const apiKey = getEnv('NEXT_PUBLIC_LIGHTHOUSE_API_KEY');
    if (!apiKey) {
      throw new Error('LIGHTHOUSE_API_KEY is not defined');
    }

    const response = await Lighthouse.uploadEncrypted(
      file,
      apiKey,
      accessControlConditions
    );

    return response;
  } catch (error) {
    console.error('Error encrypting file:', error);
    throw error;
  }
}

/**
 * Get the status of a Filecoin deal
 * @param cid The CID of the content
 * @returns Deal status
 */
export async function getFilecoinDealStatus(cid: string): Promise<any> {
  try {
    const apiKey = getEnv('NEXT_PUBLIC_LIGHTHOUSE_API_KEY');
    if (!apiKey) {
      throw new Error('LIGHTHOUSE_API_KEY is not defined');
    }

    const status = await Lighthouse.dealStatus(apiKey, { cid });
    return status;
  } catch (error) {
    console.error('Error getting deal status:', error);
    throw error;
  }
}

/**
 * Get the content of a dataset using its CID
 * @param cid Content identifier for the dataset
 * @returns The dataset content as a JavaScript object
 */
export async function getDatasetContent(cid: string): Promise<any> {
  try {
    const { dataset } = await retrieveDataset(cid);
    return dataset;
  } catch (error) {
    console.error('Error retrieving dataset content:', error);
    throw error;
  }
}
