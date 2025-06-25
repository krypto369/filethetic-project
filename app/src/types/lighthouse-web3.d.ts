declare module '@lighthouse-web3/sdk' {
  export interface UploadProgressData {
    total: number;
    uploaded: number;
  }

  export interface UploadResponse {
    data: {
      Name: string;
      Hash: string;
      Size: string;
    };
  }

  export function upload(
    e: File | Blob,
    apiKey: string,
    uploadProgressCallback?: (data: UploadProgressData) => void
  ): Promise<UploadResponse>;
}
