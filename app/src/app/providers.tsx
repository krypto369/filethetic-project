'use client';

import * as React from 'react';
import '@rainbow-me/rainbowkit/styles.css';

import {
    getDefaultConfig,
    RainbowKitProvider,
    getDefaultWallets,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
    QueryClientProvider,
    QueryClient,
} from "@tanstack/react-query";
import 'dotenv/config'

import {
sepolia,
filecoinCalibration,
filecoin
} from 'wagmi/chains';

// const projectId = process.env.WALLET_CONNECT_PROJECT_ID || '';
const projectId = '9811958bd307518b364ff7178034c435';


const config = getDefaultConfig({
    appName: 'My RainbowKit App',
    projectId: projectId,
    chains: [filecoinCalibration, sepolia, filecoin],
    ssr: true, // If your dApp uses server side rendering (SSR)
});

// const connectors = connectorsForWallets([
//     ...wallets,
//     {
//         groupName: 'Other',
//         wallets: [
//             argentWallet({ projectId, chains }),
//             trustWallet({ projectId, chains }),
//             ledgerWallet({ projectId, chains }),
//         ],
//     },
// ]);
const { wallets } = getDefaultWallets({
    appName: 'RainbowKit demo',
    projectId,
});

const demoAppInfo = {
    appName: 'My Wallet Demo',
};

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {mounted ? (
                    <RainbowKitProvider appInfo={demoAppInfo}>
                        {children}
                    </RainbowKitProvider>
                ) : (
                    <div style={{ visibility: "hidden" }}>
                        {children}
                    </div>
                )}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
