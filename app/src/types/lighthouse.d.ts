declare module '@lighthouse-web3/sdk' {
  export interface DealParams {
    cid: string;
    network?: string;
    dealDuration?: number;
    numOfCopies?: number;
  }

  export interface AccessControlConditions {
    id: number;
    chain: string;
    method: string;
    standardContractType: string;
    contractAddress: string;
    returnValueTest: {
      comparator: string;
      value: string;
    };
    parameters: string[];
  }

  export class Lighthouse {
    static uploadEncrypted(
      file: File,
      apiKey: string,
      accessControlConditions: any[]
    ): Promise<any>;

    static dealStatus(
      apiKey: string,
      params: DealParams
    ): Promise<any>;
    
    static getAccessConditions(cid: string): Promise<any>;
  }
}
