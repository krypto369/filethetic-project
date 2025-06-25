declare module 'web3.storage' {
  export interface Web3StorageOptions {
    token: string;
    endpoint?: string;
  }
  
  export interface PutOptions {
    name?: string;
    maxRetries?: number;
    wrapWithDirectory?: boolean;
    onRootCidReady?: (cid: string) => void;
    onStoredChunk?: (size: number) => void;
  }
  
  export class Web3Storage {
    constructor(options: Web3StorageOptions);
    put(files: File[], options?: PutOptions): Promise<string>;
    get(cid: string): Promise<{ ok: boolean; files: () => Promise<File[]>; }>;
    status(cid: string): Promise<{ cid: string; dagSize: number; created: Date; pins: Array<any>; deals: Array<any>; }>;
  }
}
