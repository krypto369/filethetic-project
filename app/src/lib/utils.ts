import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Dataset } from "@/types/dataset"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string) { 
  return address.slice(0, 6) + "..." + address.slice(-4);
}

/**
 * Decrypt a dataset's content (if encrypted)
 * In a real app, this would handle actual decryption
 * For now, it just returns the dataset as-is
 */
export async function decryptDataset(dataset: Dataset): Promise<Dataset> {
  // In a real app, this would decrypt encrypted content using keys or permissions
  // For now, we just simulate a delay and return the dataset
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dataset);
    }, 500); // simulate decryption time
  });
}