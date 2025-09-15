import type { Address, PublicClient } from "viem";

export const ERC20_ABI = [
  {
    type: "function",
    stateMutability: "view",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }]
  },
  {
    type: "function",
    stateMutability: "view",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }]
  }
] as const;

export async function getErc20Balance(
  client: PublicClient,
  userAddress: Address,
  tokenAddress: Address
): Promise<bigint> {
  return client.readContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [userAddress]
  });
}

export async function getErc20Decimals(
  client: PublicClient,
  tokenAddress: Address
): Promise<number> {
  const value = await client.readContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "decimals"
  });
  return Number(value);
}

