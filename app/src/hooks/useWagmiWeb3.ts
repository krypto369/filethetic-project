'use client';

import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { injected } from 'wagmi/connectors';

/**
 * Hook for accessing web3 functionality consistently across the app
 * This wraps wagmi hooks to provide a simpler API that matches what components expect
 */
export function useWagmiWeb3() {
  const { address, isConnected } = useAccount();
  const { connectAsync, isPending: isConnecting } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const chainId = useChainId();

  const connectWallet = async () => {
    try {
      await connectAsync({ connector: injected() });
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnectAsync();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return {
    account: address || null,
    isConnected,
    isConnecting,
    chainId: chainId || null,
    connectWallet,
    disconnectWallet,
  };
}
