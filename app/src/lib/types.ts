/**
 * Type definitions for the Filethetic application
 */

export interface Dataset {
  id: number;
  version: number;
  owner: string;
  name: string;
  description: string;
  price: string;
  isPublic: boolean;
  cid: string;
  numRows: number;
  numTokens: number;
  modelName: string;
  taskId: number;
  nodeId: number;
  computeUnitsPrice: number;
  maxComputeUnits: number;
  numDownloads: number;
  isVerified?: boolean;
  verificationTimestamp?: number;
  verifier?: string;
}

export interface VerificationInfo {
  isVerified: boolean;
  timestamp: number;
  verifier: string;
}

export type HFDataset = {
  path: string;
  config: string;
  split: string;
  features: string[];
}

export type GenerationConfig = {
  model: string;
  inputFeature: string;
  maxTokens: number;
  prompt: string;
  jsonSchema?: any;
}

export interface DatasetSortOptions {
  field: 'name' | 'price' | 'numRows' | 'numTokens' | 'numDownloads' | 'timestamp';
  direction: 'asc' | 'desc';
}

export interface DatasetFilterOptions {
  verified?: boolean;
  minPrice?: number;
  maxPrice?: number;
  ownedOnly?: boolean;
  searchTerm?: string;
  taskId?: number;
  modelName?: string;
}

export interface UploadProgress {
  status: 'idle' | 'uploading' | 'success' | 'error';
  message: string;
  progress: number;
  cid?: string;
}

export interface Web3ProviderState {
  account: string | null;
  chainId: number;
  isConnecting: boolean;
  error: Error | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

// Window interface extension for Ethereum providers
declare global {
  interface Window {
    ethereum?: any;
  }
}
