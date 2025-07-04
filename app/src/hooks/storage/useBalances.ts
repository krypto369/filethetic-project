import { useQuery } from "@tanstack/react-query";
import { Synapse, TOKENS } from "@filoz/synapse-sdk";
import { useEthersProvider } from "@/hooks/storage/useEthers";
import { useAccount } from "wagmi";
import { calculateStorageMetrics } from "@/utils/calculateStorageMetrics";
import { useNetwork } from "@/hooks/storage/useNetwork";
import { formatUnits } from "viem";
import { defaultBalances, UseBalancesResponse } from "@/types";

/**
 * Hook to fetch and format wallet balances and storage metrics
 */
export const useBalances = () => {
  const provider = useEthersProvider();
  const { address } = useAccount();
  const { data: network } = useNetwork();

  const query = useQuery({
    enabled: !!address && !!provider && !!network,
    queryKey: ["balances", address, network],
    queryFn: async (): Promise<UseBalancesResponse> => {
      if (!provider) throw new Error("Provider not found");
      if (!network) throw new Error("Network not found");

      const synapse = await Synapse.create({ provider: provider as any });

      // Fetch raw balances
      const [filRaw, usdfcRaw, paymentsRaw] = await Promise.all([
        synapse.payments.walletBalance(),
        synapse.payments.walletBalance(TOKENS.USDFC),
        synapse.payments.balance(TOKENS.USDFC),
      ]);

      const usdfcDecimals = synapse.payments.decimals(TOKENS.USDFC);

      // Calculate storage metrics
      const storageMetrics = await calculateStorageMetrics(synapse);

      // Return value matching the UseBalancesResponse interface
      return {
        filBalance: filRaw,
        usdfcBalance: usdfcRaw,
        pandoraBalance: paymentsRaw,
        filBalanceFormatted: formatBalance(filRaw, 18),
        usdfcBalanceFormatted: formatBalance(usdfcRaw, usdfcDecimals),
        pandoraBalanceFormatted: formatBalance(paymentsRaw, usdfcDecimals),
        ...storageMetrics,
        // Add the required properties from the interface
        balances: {
          fil: formatUnits(filRaw, 18),
          usdc: formatUnits(usdfcRaw, usdfcDecimals),
          payments: formatUnits(paymentsRaw, usdfcDecimals),
        },
        storage: {
          used: storageMetrics.currentStorageGB.toString(),
          available: storageMetrics.currentRateAllowanceGB.toString(),
          percentUsed: storageMetrics.currentStorageGB > 0 ? 
            (storageMetrics.currentStorageGB / (storageMetrics.currentRateAllowanceGB || 1)) * 100 : 0,
        },
        isLoading: false,
        error: null,
      };
    },
  });

  return {
    ...query,
    data: query.data || defaultBalances,
  };
};

/**
 * Formats a balance value with specified decimals
 */
export const formatBalance = (balance: bigint, decimals: number): number => {
  return Number(Number(formatUnits(balance, decimals)).toFixed(5));
};
