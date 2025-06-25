/**
 * Type definitions for the Filethetic application
 */

// Re-export types from lib/types.ts
export * from '@/lib/types';

export type SiteConfig = {
  name: string
  author: string
  description: string
  keywords: Array<string>
  url: {
    base: string
    author: string
  }
  links: {
    github: string
  }
  ogImage: string
}

// Balance types
export interface UseBalancesResponse {
  balances: {
    fil: string;
    usdfc: string;
    payments: string;
  };
  storage: {
    used: string;
    available: string;
    percentUsed: number;
  };
  isLoading: boolean;
  error: Error | null;
}

// export const defaultBalancesToken: UseBalancesResponse = {
//   balances: {
//     fil: '0',
//     usdfc: '0',
//     payments: '0',
//   },
//   storage: {
//     used: '0',
//     available: '0',
//     percentUsed: 0,
//   },
//   isLoading: false,
//   error: null,
// };

// Proofset types
export interface Provider {
  id: number;
  name: string;
  pdpUrl: string;
  minPrice: bigint;
  maxPrice: bigint;
  minSize: bigint;
  maxSize: bigint;
  minDuration: bigint;
  maxDuration: bigint;
}

export interface ProofSetDetails {
  id: number;
  size: string;
  duration: string;
  created: string;
  expires: string;
  status: string;
  files: {
    name: string;
    size: string;
    cid: string;
    status: string;
  }[];
}

export interface ProofSetsResponse {
  proofsets: {
    id: number;
    providerId: number;
    providerName: string;
    pdpUrl: string;
    details: ProofSetDetails | null;
  }[];
  isLoading: boolean;
  error: Error | null;
}

export interface Root {
  rootId: number;
  rootCid: string;
  subrootCid: string;
  subrootOffset: number;
}

export interface Provider {
  owner: string;
  pdpUrl: string;
}

export interface ProofSetDetails {
  id: number;
  roots: Root[];
  nextChallengeEpoch: number;
  pdpUrl: string;
}

export interface ProofSet {
  railId: number;
  payer: string;
  payee: string;
  commissionBps: number;
  metadata: string;
  rootMetadata: any[];
  clientDataSetId: number;
  withCDN: boolean;
  pdpVerifierProofSetId: number;
  nextRootId: number;
  currentRootCount: number;
  isLive: boolean;
  isManaged: boolean;
  details: ProofSetDetails | null;
  pdpUrl: string | null;
  provider: Provider | null;
}

export interface ProofSetsResponse {
// @ts-ignore
  proofsets: ProofSet[];
}

/**
 * Interface for formatted balance data returned by useBalances
 */
export interface UseBalancesResponse {
  // Properties returned by useBalances.ts
  filBalance: bigint;
  usdfcBalance: bigint;
  pandoraBalance: bigint;
  filBalanceFormatted: number;
  usdfcBalanceFormatted: number;
  pandoraBalanceFormatted: number;
  persistenceDaysLeft: number;
  persistenceDaysLeftAtCurrentRate: number;
  isSufficient: boolean;
  isRateSufficient: boolean;
  isLockupSufficient: boolean;
  rateNeeded: bigint;
  totalLockupNeeded: bigint;
  depositNeeded: bigint;
  currentRateAllowanceGB: number;
  currentStorageGB: number;
  currentLockupAllowance: bigint;
  
  // Properties for UI components
  balances: {
    fil: string;
    usdfc: string;
    payments: string;
  };
  storage: {
    used: string;
    available: string;
    percentUsed: number;
  };
  isLoading: boolean;
  error: Error | null;
}

// @ts-ignore
export const defaultBalances: UseBalancesResponse = {
  filBalance: 0n,
  usdfcBalance: 0n,
  pandoraBalance: 0n,
  filBalanceFormatted: 0,
  usdfcBalanceFormatted: 0,
  pandoraBalanceFormatted: 0,
  persistenceDaysLeft: 0,
  persistenceDaysLeftAtCurrentRate: 0,
  isSufficient: false,
  isRateSufficient: false,
  isLockupSufficient: false,
  rateNeeded: 0n,
  totalLockupNeeded: 0n,
  depositNeeded: 0n,
  currentRateAllowanceGB: 0,
  currentStorageGB: 0,
  currentLockupAllowance: 0n,
  // Add the missing properties required by the interface
  balances: {
    fil: '0',
    usdfc: '0',
    payments: '0',
  },
  storage: {
    used: '0',
    available: '0',
    percentUsed: 0,
  },
  isLoading: false,
  error: null,
};

/**
 * Interface representing the Pandora balance data returned from the SDK
 */
export interface PandoraBalanceData {
  rateAllowanceNeeded: bigint;
  currentRateUsed: bigint;
  currentRateAllowance: bigint;
  currentLockupAllowance: bigint;
  currentLockupUsed: bigint;
}

/**
 * Interface representing the calculated storage metrics
 */
export interface StorageCalculationResult {
  /** The required rate allowance needed for storage */
  rateNeeded: bigint;
  /** The current rate used */
  rateUsed: bigint;
  /** The current storage usage in bytes */
  currentStorageBytes: bigint;
  /** The current storage usage in GB */
  currentStorageGB: number;
  /** The required lockup amount needed for storage persistence */
  totalLockupNeeded: bigint;
  /** The additional lockup amount needed for storage persistence */
  depositNeeded: bigint;
  /** Number of days left before lockup expires */
  persistenceDaysLeft: number;
  /** Number of days left before lockup expires at current rate */
  persistenceDaysLeftAtCurrentRate: number;
  /** Whether the current rate allowance is sufficient */
  isRateSufficient: boolean;
  /** Whether the current lockup allowance is sufficient for at least the minimum days threshold */
  isLockupSufficient: boolean;
  /** Whether both rate and lockup allowances are sufficient */
  isSufficient: boolean;
  /** The current rate allowance in GB */
  currentRateAllowanceGB: number;
  /** The current lockup allowance in USDFC */
  currentLockupAllowance: bigint;
}

export interface PaymentActionProps extends SectionProps {
  totalLockupNeeded?: bigint;
  currentLockupAllowance?: bigint;
  rateNeeded?: bigint;
  depositNeeded?: bigint;
  isProcessingPayment: boolean;
  onPayment: (params: {
    lockupAllowance: bigint;
    epochRateAllowance: bigint;
    depositAmount: bigint;
  }) => Promise<void>;
  handleRefetchBalances: () => Promise<void>;
}

export interface StatusMessageProps {
  status?: string;
}

export interface SectionProps {
  balances?: UseBalancesResponse;
  isLoading?: boolean;
}

export interface AllowanceItemProps {
  label: string;
  isSufficient?: boolean;
  isLoading?: boolean;
}
