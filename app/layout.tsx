import "./global.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import dynamic from "next/dynamic";
import { defineChain } from "viem";

const Web3Provider = dynamic(() => import("@/components/providers/Web3Provider"), { ssr: false });

export const metadata: Metadata = {
  title: "iExec Confidential AI Playground",
  description: "Run AI on private data using TEE-based compute."
};

export function getChains() {
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

  return [customChain];
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
        <Toaster theme="dark" richColors closeButton />
      </body>
    </html>
  );
}

