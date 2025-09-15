"use client";

import React from "react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, createStorage, http } from "wagmi";
import { injected, coinbaseWallet } from "wagmi/connectors";
import { defineChain } from "viem";

type Web3ProviderProps = {
  children: React.ReactNode;
};

export default function Web3Provider({ children }: Web3ProviderProps) {
  const chainIdFromEnv = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "0");
  const rpcUrlFromEnv = process.env.NEXT_PUBLIC_RPC_URL ?? "http://localhost:8545";
  const chainNameFromEnv = process.env.NEXT_PUBLIC_CHAIN_NAME ?? (chainIdFromEnv ? `Chain ${chainIdFromEnv}` : "Custom Chain");

  const customChain = defineChain({
    id: chainIdFromEnv || 1337,
    name: chainNameFromEnv,
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: { http: [rpcUrlFromEnv] }
    }
  });

  const config = React.useMemo(() => createConfig({
    chains: [customChain],
    transports: {
      [customChain.id]: http(rpcUrlFromEnv)
    },
    connectors: [
      injected(),
      coinbaseWallet({ appName: "Confidential AI Playground" })
    ],
    multiInjectedProviderDiscovery: true,
    storage: createStorage({ storage: localStorage }),
    ssr: true
  }), [customChain.id, rpcUrlFromEnv]);

  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

