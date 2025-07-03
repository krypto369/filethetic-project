/**
 * Type adapter utilities to handle incompatible dataset types in the codebase
 */

import { Dataset as LegacyDataset } from "@/lib/types";
import { Dataset as ModernDataset } from "@/types/dataset";

/**
 * Convert a legacy dataset to a modern dataset format
 */
export function legacyToModernDataset(dataset: LegacyDataset): ModernDataset {
  return {
    id: String(dataset.id), // Convert number to string
    name: dataset.name,
    description: dataset.description,
    owner: dataset.owner,
    numRows: dataset.numRows,
    model: dataset.modelName,
    downloads: dataset.numDownloads,
    price: Number(dataset.price), // Convert string to number
    isVerified: dataset.isVerified,
    // verifier is not in the ModernDataset type, so we'll add it to metadata
    metadata: {
      tokenCount: dataset.numTokens,
      ipfsHash: dataset.cid,
      computeUnitsPrice: dataset.computeUnitsPrice,
      maxComputeUnits: dataset.maxComputeUnits,
      version: dataset.version,
      nodeId: dataset.nodeId,
      taskId: dataset.taskId,
      verifier: dataset.verifier
    },
    createdAt: dataset.verificationTimestamp ? new Date(dataset.verificationTimestamp * 1000) : undefined,
    isPrivate: !dataset.isPublic
  };
}

/**
 * Convert a modern dataset to a legacy dataset format
 */
export function modernToLegacyDataset(dataset: ModernDataset): LegacyDataset {
  return {
    id: parseInt(dataset.id) || 0, // Convert string to number, default to 0 if parsing fails
    name: dataset.name,
    description: dataset.description || "",
    owner: dataset.owner,
    numRows: dataset.numRows || 0,
    numTokens: dataset.tokenCount || 0,
    numDownloads: dataset.downloads || 0,
    isVerified: dataset.isVerified || false,
    verifier: dataset.metadata?.verifier as string | undefined,
    price: String(dataset.price || 0), // Convert number to string
    isPublic: !dataset.isPrivate,
    // Provide default values for required fields in legacy format
    version: 1,
    cid: dataset.metadata?.ipfsHash || "",
    modelName: dataset.model || "Unknown",
    taskId: dataset.metadata?.taskId || 0,
    nodeId: dataset.metadata?.nodeId || 0,
    computeUnitsPrice: dataset.metadata?.computeUnitsPrice || 0,
    maxComputeUnits: dataset.metadata?.maxComputeUnits || 0,
    verificationTimestamp: dataset.createdAt instanceof Date 
      ? Math.floor(dataset.createdAt.getTime() / 1000) 
      : typeof dataset.createdAt === 'string' 
        ? Math.floor(new Date(dataset.createdAt).getTime() / 1000) 
        : Math.floor(Date.now() / 1000)
  };
}
