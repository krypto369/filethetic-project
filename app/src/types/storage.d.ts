declare module '@/lib/storage' {
  export interface UploadProgressCallback {
    (progress: number): void;
  }

  export function storeWithWeb3Storage(
    file: File | Blob | File[],
    name: string
  ): Promise<string>;

  export function uploadToLighthouse(
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<string>;
}
