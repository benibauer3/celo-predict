import { createPublicClient, http } from "viem";
import { ACTIVE_CHAIN } from "./contract";

export const publicClient = createPublicClient({
  chain: ACTIVE_CHAIN,
  transport: http(),
});

export function formatUSDm(wei: bigint, decimals = 2): string {
  const n = Number(wei) / 1e18;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function parseUSDm(amount: string): bigint {
  const n = parseFloat(amount);
  if (isNaN(n) || n <= 0) return 0n;
  return BigInt(Math.round(n * 1e18));
}

export function formatPercent(a: bigint, b: bigint): number {
  const total = a + b;
  if (total === 0n) return 50;
  return Math.round((Number(a) / Number(total)) * 100);
}

export function timeLeft(endTime: bigint): string {
  const diff = Number(endTime) - Math.floor(Date.now() / 1000);
  if (diff <= 0) return "Ended";
  const d = Math.floor(diff / 86400);
  const h = Math.floor((diff % 86400) / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}
