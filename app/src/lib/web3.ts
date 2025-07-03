import { ethers, Signer, Contract, BrowserProvider, JsonRpcProvider, formatUnits, parseUnits, Interface } from 'ethers';
import FilethethicABI from '@/abi/Filethetic.json';
import FilethethicDatasetNFTABI from '@/abi/FilethethicDatasetNFT.json';
import FilethethicVerifierABI from '@/abi/FilethethicVerifier.json';
import USDFCABI from '@/abi/MockUSDC.json';
import { getEnv } from '@/env.mjs';
import { Dataset, VerificationInfo, DatasetFilterOptions, DatasetSortOptions } from './types';

// Import deployment configuration files
import localhostDeployment from '@/deployments/localhost.json';
import mumbaiDeployment from '@/deployments/mumbai.json';
import filecoinCalibrationDeployment from '@/deployments/filecoinCalibration.json';

/**
 * Web3 integration for Filethetic
 * Provides functionality for interacting with the blockchain
 */

// Initialize constants
let provider: BrowserProvider | null = null;
let signer: Signer | null = null;
let filetheticContract: Contract | null = null;
let datasetNFTContract: Contract | null = null;
let verifierContract: Contract | null = null;
let usdcContract: Contract | null = null;

/**
 * Initialize the ethers provider
 * @returns Ethers provider
 */
export async function getProvider(): Promise<BrowserProvider> {
  if (typeof window === 'undefined') return null as any;

  if (!provider && window.ethereum) {
    // For ethers v6, use BrowserProvider to wrap the window.ethereum object
    provider = new ethers.BrowserProvider(window.ethereum);
  } else if (!provider) {
    // If you want to connect to a specific RPC URL, you can do it here
    // For example: provider = new JsonRpcProvider(getEnv('NEXT_PUBLIC_RPC_URL'));
    // But for a dapp, BrowserProvider is usually what you want.
    throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
  }

  return provider;
}

/**
 * Get the current signer (connected wallet)
 * @returns Ethers signer
 */
export async function getSigner(): Promise<Signer> {
  if (!signer) {
    const provider = await getProvider();
    // In ethers v6, we need to await the getSigner call
    signer = await provider.getSigner();
  }
  return signer;
}

/**
 * Reset the web3 state (useful for wallet disconnections)
 */
export function resetWeb3State() {
  provider = null;
  signer = null;
  filetheticContract = null;
  datasetNFTContract = null;
  verifierContract = null;
  usdcContract = null;
}

/**
 * Load contract addresses from deployment JSON file
 * @param chainId The current chain ID
 * @returns Contract addresses
 */
export function getContractAddresses(chainId: number): {
  filethetic: string;
  filethethicDatasetNFT: string;
  filethethicVerifier: string;
  usdfc: string;
} {
  // Get deployment addresses based on the network
  let deploymentInfo: any;
  
  try {
    if (chainId === 31337) {
      // Local hardhat network
      deploymentInfo = localhostDeployment;
    } else if (chainId === 314159) {
      // Filecoin Calibration testnet
      deploymentInfo = filecoinCalibrationDeployment;
    } else {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    
    return {
      filethetic: deploymentInfo.filethetic,
      filethethicDatasetNFT: deploymentInfo.filethethicDatasetNFT,
      filethethicVerifier: deploymentInfo.filethethicVerifier,
      usdc: deploymentInfo.mockUSDC || getEnv('NEXT_PUBLIC_USDC_ADDRESS'),
    };
  } catch (error) {
    console.error('Error loading contract addresses:', error);
    throw new Error(`Deployment info not found for chain ID: ${chainId}`);
  }
}

/**
 * Get the Filethetic contract instance
 * @returns Filethetic contract instance
 */
export async function getFilethethicContract(): Promise<ethers.Contract> {
  if (!filetheticContract) {
    const signer = await getSigner();
    const provider = await getProvider();
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    const addresses = getContractAddresses(chainId);
    filetheticContract = new ethers.Contract(
      addresses.filethetic,
      FilethethicABI.abi,
      signer
    );
  }
  
  return filetheticContract;
}

/**
 * Get the FilethethicDatasetNFT contract instance
 * @returns FilethethicDatasetNFT contract instance
 */
export async function getDatasetNFTContract(): Promise<ethers.Contract> {
  if (!datasetNFTContract) {
    const signer = await getSigner();
    const provider = await getProvider();
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    const addresses = getContractAddresses(chainId);
    datasetNFTContract = new ethers.Contract(
      addresses.filethethicDatasetNFT,
      FilethethicDatasetNFTABI.abi,
      signer
    );
  }
  
  return datasetNFTContract;
}

/**
 * Get the FilethethicVerifier contract instance
 * @returns FilethethicVerifier contract instance
 */
export async function getVerifierContract(): Promise<ethers.Contract> {
  if (!verifierContract) {
    const signer = await getSigner();
    const provider = await getProvider();
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    const addresses = getContractAddresses(chainId);
    verifierContract = new ethers.Contract(
      addresses.filethethicVerifier,
      FilethethicVerifierABI.abi,
      signer
    );
  }
  
  return verifierContract;
}

/**
 * Get the USDFC contract instance
 * @returns USDFC contract instance
 */
export async function getUSDCContract(): Promise<ethers.Contract> {
  if (!usdcContract) {
    const signer = await getSigner();
    const provider = await getProvider();
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    const addresses = getContractAddresses(chainId);
    usdcContract = new ethers.Contract(
      addresses.usdc,
      USDCABI.abi,
      signer
    );
  }
  
  return usdcContract;
}

/**
 * Create a new dataset on the blockchain
 * @param name Dataset name
 * @param description Dataset description
 * @param price Price in USDFC (in smallest unit, 6 decimals)
 * @param isPublic Whether the dataset is public (sellable)
 * @param modelName Name of the LLM model used
 * @param taskId Task identifier
 * @param nodeId Node identifier
 * @param computeUnitsPrice Price per one million compute units
 * @param maxComputeUnits Maximum number of compute units
 * @returns Transaction receipt and dataset ID
 */
export async function createDataset(
  name: string,
  description: string,
  price: string,
  isPublic: boolean,
  modelName: string,
  taskId: number,
  nodeId: number,
  computeUnitsPrice: number,
  maxComputeUnits: number
): Promise<{ receipt: any; datasetId: number }> {
  try {
    const contract = await getFilethethicContract();
    
    const tx = await contract.createDataset(
      name,
      description,
      parseUnits(price, 6), // USDFC has 6 decimals
      isPublic,
      modelName,
      taskId,
      nodeId,
      computeUnitsPrice,
      maxComputeUnits
    );
    
    const receipt = await tx.wait();
    
    // Get the dataset ID from the transaction logs
    const datasetCreatedEvent = receipt.logs.find((log: any) => {
      try {
        const parsedLog = contract.interface.parseLog(log);
        return parsedLog?.name === 'DatasetCreated';
      } catch (error) {
        return false;
      }
    });
    
    // Extract dataset ID from the event
    if (!datasetCreatedEvent) {
      throw new Error('DatasetCreated event not found in transaction logs');
    }
    
    // In ethers v6, parseLog returns { fragment, name, args } instead of a LogDescription
    const parsedEvent = contract.interface.parseLog(datasetCreatedEvent);
    const datasetId = parsedEvent?.args?.datasetId?.toNumber ? parsedEvent.args.datasetId.toNumber() : Number(parsedEvent?.args?.datasetId);
    
    return { receipt, datasetId };
  } catch (error) {
    console.error('Error creating dataset:', error);
    throw error;
  }
}

/**
 * Lock a dataset with its IPFS CID
 * @param datasetId Dataset ID
 * @param cid IPFS content identifier
 * @param numRows Number of rows in the dataset
 * @param numTokens Number of tokens in the dataset
 * @returns Transaction receipt
 */
export async function lockDataset(
  datasetId: number,
  cid: string,
  numRows: number,
  numTokens: number
): Promise<any> {
  try {
    const contract = await getFilethethicContract();
    
    const tx = await contract.lockDataset(datasetId, cid, numRows, numTokens);
    const receipt = await tx.wait();
    
    return receipt;
  } catch (error) {
    console.error('Error locking dataset:', error);
    throw error;
  }
}

/**
 * Purchase a dataset
 * @param datasetId Dataset ID
 * @param price Price in USDFC
 * @returns Transaction receipt
 */
export async function purchaseDataset(
  datasetId: number,
  price: string
): Promise<any> {
  try {
    const filetheticContract = await getFilethethicContract();
    const usdcContract = await getUSDCContract();
    
    // First approve the USDFC transfer
    const filetheticAddress = await filetheticContract.address;
    const approveTx = await usdcContract.approve(
      filetheticAddress,
      parseUnits(price, 6) // USDFC has 6 decimals
    );
    await approveTx.wait();
    
    // Then purchase the dataset
    const tx = await filetheticContract.purchaseDataset(datasetId);
    const receipt = await tx.wait();
    
    return receipt;
  } catch (error) {
    console.error('Error purchasing dataset:', error);
    throw error;
  }
}

/**
 * Get a dataset by ID
 * @param datasetId Dataset ID
 * @returns Dataset information
 */
export async function getDataset(datasetId: number): Promise<Dataset> {
  try {
    const contract = await getFilethethicContract();
    const dataset = await contract.getDataset(datasetId);
    
    // Get verification status from the verifier contract
    const verificationInfo = await getDatasetVerificationInfo(datasetId);
    
    // Format the dataset for frontend use
    return {
      id: Number(dataset.id),
      version: Number(dataset.version),
      owner: dataset.owner,
      name: dataset.name,
      description: dataset.description,
      price: formatUnits(dataset.price, 6), // USDFC has 6 decimals
      isPublic: dataset.isPublic,
      cid: dataset.cid,
      numRows: Number(dataset.numRows),
      numTokens: Number(dataset.numTokens),
      modelName: dataset.modelName,
      taskId: Number(dataset.taskId),
      nodeId: Number(dataset.nodeId),
      computeUnitsPrice: Number(dataset.computeUnitsPrice),
      maxComputeUnits: Number(dataset.maxComputeUnits),
      numDownloads: Number(dataset.numDownloads),
      isVerified: verificationInfo.isVerified,
      verificationTimestamp: verificationInfo.timestamp,
      verifier: verificationInfo.verifier
    };
  } catch (error) {
    console.error('Error getting dataset:', error);
    throw error;
  }
}

/**
 * Check if a user has access to a dataset
 * @param datasetId Dataset ID
 * @param address User address
 * @returns Whether the user has access
 */
export async function hasDatasetAccess(
  datasetId: number,
  address?: string
): Promise<boolean> {
  try {
    const contract = await getFilethethicContract();
    const userAddress = address || await (await getSigner()).getAddress();
    
    return await contract.hasAccess(datasetId, userAddress);
  } catch (error) {
    console.error('Error checking dataset access:', error);
    return false;
  }
}

/**
 * Check if a user has access to a dataset (alias for hasDatasetAccess)
 * @param datasetId Dataset ID
 * @param address User address (optional)
 * @returns Whether the user has access
 */
export async function hasAccessToDataset(
  datasetId: number,
  address?: string
): Promise<boolean> {
  return hasDatasetAccess(datasetId, address);
}

/**
 * Verify a dataset's authenticity
 * @param datasetId Dataset ID
 * @param datasetHash Hash of the dataset
 * @param signature Cryptographic signature of the dataset hash
 * @param signerAddress Address that signed the hash
 * @returns Transaction receipt
 */
export async function verifyDataset(
  datasetId: number,
  datasetHash: string,
  signature: string,
  signerAddress: string
): Promise<any> {
  try {
    const contract = await getVerifierContract();
    
    const tx = await contract.verifyDataset(
      datasetId,
      datasetHash,
      signature,
      signerAddress
    );
    const receipt = await tx.wait();
    
    return receipt;
  } catch (error) {
    console.error('Error verifying dataset:', error);
    throw error;
  }
}

/**
 * Check if a wallet is connected
 * @returns Whether a wallet is connected
 */
export async function isWalletConnected(): Promise<boolean> {
  try {
    const provider = await getProvider();
    const accounts = await provider.listAccounts();
    return accounts.length > 0;
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return false;
  }
}

/**
 * Connect wallet
 * @returns Connected account address
 */
export async function connectWallet(): Promise<string> {
  try {
    const provider = await getProvider();
    await provider.send('eth_requestAccounts', []);
    const accounts = await provider.listAccounts();
    signer = await provider.getSigner();
    // In ethers v6, we need to get the address from the signer
    const address = await signer.getAddress();
    return address;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
}

/**
 * Get the current wallet address
 * @returns Wallet address
 */
export async function getWalletAddress(): Promise<string> {
  try {
    const signer = await getSigner();
    return await signer.getAddress();
  } catch (error) {
    console.error('Error getting wallet address:', error);
    throw error;
  }
}

/**
 * Get all datasets on the platform with optional filtering
 * @param filters Optional filtering options
 * @param sortOptions Optional sorting options
 * @returns Array of formatted datasets
 */
export async function getAllDatasets(
  filters?: DatasetFilterOptions,
  sortOptions?: DatasetSortOptions
): Promise<Dataset[]> {
  try {
    const contract = await getFilethethicContract();
    
    // Get total dataset count
    const datasetCount = await contract.getDatasetCount();
    const totalDatasets = Number(datasetCount);
    
    // Get all datasets
    const datasets: Dataset[] = [];
    for (let i = 1; i <= totalDatasets; i++) {
      try {
        const dataset = await getDataset(i);
        datasets.push(dataset);
      } catch (error) {
        console.warn(`Error fetching dataset ${i}:`, error);
      }
    }
    
    // Apply filters if provided
    let filteredDatasets = datasets;
    if (filters) {
      // Get wallet address for ownership filtering if needed
      let currentWalletAddress = '';
      if (filters.ownedOnly) {
        try {
          currentWalletAddress = await getWalletAddress();
        } catch (error) {
          console.warn('Error getting wallet address:', error);
        }
      }
      
      // Apply all filters
      filteredDatasets = datasets.filter(dataset => {
        // Filter by verified status
        if (filters.verified !== undefined && dataset.isVerified !== filters.verified) {
          return false;
        }
        
        // Filter by price range
        const price = parseFloat(dataset.price);
        if (filters.minPrice !== undefined && price < filters.minPrice) {
          return false;
        }
        if (filters.maxPrice !== undefined && price > filters.maxPrice) {
          return false;
        }
        
        // Filter by ownership
        if (filters.ownedOnly && currentWalletAddress) {
          if (dataset.owner.toLowerCase() !== currentWalletAddress.toLowerCase()) {
            return false;
          }
        } else if (filters.ownedOnly) {
          // If we wanted to filter by ownership but couldn't get the wallet address
          return false;
        }
        
        // Filter by search term
        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase();
          const matchesName = dataset.name.toLowerCase().includes(term);
          const matchesDescription = dataset.description.toLowerCase().includes(term);
          if (!matchesName && !matchesDescription) {
            return false;
          }
        }
        
        // Filter by task ID
        if (filters.taskId !== undefined && dataset.taskId !== filters.taskId) {
          return false;
        }
        
        // Filter by model name
        if (filters.modelName && dataset.modelName !== filters.modelName) {
          return false;
        }
        
        return true;
      });
    }
    
    // Sort datasets if sort options provided
    if (sortOptions) {
      filteredDatasets.sort((a, b) => {
        let valueA, valueB;
        
        // Extract values based on sort field
        switch (sortOptions.field) {
          case 'name':
            valueA = a.name;
            valueB = b.name;
            break;
          case 'price':
            valueA = parseFloat(a.price);
            valueB = parseFloat(b.price);
            break;
          case 'numRows':
            valueA = a.numRows;
            valueB = b.numRows;
            break;
          case 'numTokens':
            valueA = a.numTokens;
            valueB = b.numTokens;
            break;
          case 'numDownloads':
            valueA = a.numDownloads;
            valueB = b.numDownloads;
            break;
          case 'timestamp':
            valueA = a.version; // Version serves as timestamp proxy
            valueB = b.version;
            break;
          default:
            valueA = a.id;
            valueB = b.id;
        }
        
        // Apply sorting direction
        const direction = sortOptions.direction === 'asc' ? 1 : -1;
        if (valueA < valueB) return -1 * direction;
        if (valueA > valueB) return 1 * direction;
        return 0;
      });
    }
    
    return filteredDatasets;
  } catch (error) {
    console.error('Error getting all datasets:', error);
    return [];
  }
}

/**
 * Get verification information for a dataset
 * @param datasetId Dataset ID
 * @returns Verification information
 */
export async function getDatasetVerificationInfo(datasetId: number): Promise<VerificationInfo> {
  try {
    const contract = await getVerifierContract();
    const verificationInfo = await contract.getVerificationInfo(datasetId);
    
    return {
      isVerified: verificationInfo.isVerified,
      timestamp: Number(verificationInfo.timestamp),
      verifier: verificationInfo.verifier
    };
  } catch (error) {
    console.error('Error getting verification info:', error);
    return {
      isVerified: false,
      timestamp: 0,
      verifier: '0x0000000000000000000000000000000000000000'
    };
  }
}

/**
 * Check if a dataset is verified (alias for getting verification info)
 * @param datasetId Dataset ID
 * @returns Boolean indicating if dataset is verified
 */
export async function checkDatasetVerification(datasetId: number): Promise<boolean> {
  const verificationInfo = await getDatasetVerificationInfo(datasetId);
  return verificationInfo.isVerified;
}
