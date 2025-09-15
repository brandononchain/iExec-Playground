"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

function shortHash(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function Topbar() {
  const { address, isConnected } = useAccount();
  return (
    <header className="h-16 border-b border-border bg-elev/80 backdrop-blur flex items-center justify-between px-4">
      <h1 className="text-lg md:text-xl font-semibold">Confidential AI Playground</h1>
      <div className="flex items-center gap-3">
        {isConnected && (
          <span className="hidden sm:inline text-sm text-muted">{shortHash(address)}</span>
        )}
        <ConnectButton chainStatus="icon" showBalance={false} accountStatus={{ smallScreen: "avatar", largeScreen: "avatar" }} />
      </div>
    </header>
  );
}

