"use client";

import { useMemo } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { Button } from "./ui/button";

export default function ChainGuard() {
  const { isConnected } = useAccount();
  const currentChainId = useChainId();
  const { chains, switchChainAsync, isPending: isSwitching } = useSwitchChain();

  const expectedChainId = useMemo(() => chains[0]?.id, [chains]);

  const target = useMemo(() => (expectedChainId ? chains.find(c => c.id === expectedChainId) : undefined), [chains, expectedChainId]);

  if (!isConnected || !expectedChainId) return null;
  if (currentChainId === expectedChainId) return null;

  return (
    <div className="mx-4 md:mx-6 mt-3 rounded-md border border-border bg-elev/70 p-3 flex items-center justify-between">
      <div className="text-sm">
        <div className="font-medium">Wrong network</div>
        <div className="text-muted">Please switch to the expected chain (ID {expectedChainId}).</div>
      </div>
      <Button
        variant="primary"
        onClick={() => {
          if (target) void switchChainAsync({ chainId: target.id }).catch(() => {});
        }}
        disabled={isSwitching || !target}
      >
        {isSwitching ? "Switching..." : "Switch Network"}
      </Button>
    </div>
  );
}

