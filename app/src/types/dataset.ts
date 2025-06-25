export interface Dataset {
  id: string;
  name: string;
  description?: string;
  owner: string;
  size?: number;
  numRows?: number;
  numColumns?: number;
  tokenCount?: number;
  model?: string;
  downloads?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  price?: number;
  isVerified?: boolean;
  categories?: string[];
  metadata?: Record<string, any>;
  schemaUrl?: string;
  fileUrl?: string;
  contractAddress?: string;
  tokenId?: string;
  isPrivate?: boolean;
  ipfsHash?: string;
  verifier?: string;
  category?: string;
}

export interface DatasetStats {
  totalCount: number;
  verifiedCount: number;
  publicCount: number;
  privateCount: number;
  totalDownloads: number;
  averagePrice: number;
  topModels: Array<{ name: string; count: number }>;
  topCategories: Array<{ name: string; count: number }>;
  growthByMonth: Array<{ month: string; count: number }>;
}

export interface ColumnStats {
  name: string;
  type: string;
  count: number;
  uniqueCount?: number;
  nullCount?: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  median?: number;
  stdDev?: number;
  distribution?: Record<string, number>;
}
