"use client";

import { useEffect, useMemo, useState } from "react";
import { formatUnits, type Address } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { getErc20Balance, getErc20Decimals } from "@/lib/erc20";

function shortNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

export default function RlcBalance() {
  const { address, isConnected } = useAccount();
  const client = usePublicClient();
  const [balance, setBalance] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [decimals, setDecimals] = useState<number>(18);

  const tokenAddress = useMemo<undefined | Address>(() => {
    return (process.env.NEXT_PUBLIC_RLC_CONTRACT as Address | undefined) ?? undefined;
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchBalance() {
      if (!isConnected || !address || !client || !tokenAddress) {
        setBalance("");
        return;
      }
      setLoading(true);
      try {
        const [tokenDecimals, raw] = await Promise.all([
          getErc20Decimals(client, tokenAddress as Address).catch(() => 18),
          getErc20Balance(client, address as Address, tokenAddress as Address)
        ]);
        const numeric = Number(formatUnits(raw, tokenDecimals));
        if (isMounted) {
          setDecimals(tokenDecimals);
          setBalance(shortNumber(numeric));
        }
      } catch (err) {
        if (isMounted) setBalance("");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchBalance();
    const id = setInterval(fetchBalance, 30_000);
    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [isConnected, address, client, tokenAddress]);

  if (!isConnected || !tokenAddress) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      {loading ? (
        <div className="h-5 w-16 animate-pulse rounded bg-muted/40" />
      ) : (
        <span className="text-muted">{balance ? `${balance} RLC` : "-"}</span>
      )}
    </div>
  );
}

