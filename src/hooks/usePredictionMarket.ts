"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { encodeFunctionData, parseUnits, parseAbiItem, type WalletClient } from "viem";
import {
  CONTRACT_ADDRESS,
  USDM_ADDRESS,
  USDM_FEE_CURRENCY,
  PREDICTION_MARKET_ABI,
  ERC20_ABI,
} from "@/lib/contract";
import { publicClient } from "@/lib/clients";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Market {
  id: bigint;
  question: string;
  imageUrl: string;
  endTime: bigint;
  resolver: `0x${string}`;
  resolved: boolean;
  outcome: boolean;
  yesPool: bigint;
  noPool: bigint;
}

export interface Position {
  yesAmount: bigint;
  noAmount: bigint;
  claimed: boolean;
}

export interface PositionWithPnL extends Position {
  market: Market;
  payout: bigint;
  invested: bigint;
  pnl: bigint;         // realized (if resolved) or unrealized
  pnlPercent: number;
  isWinner: boolean | null; // null if unresolved
}

export interface ProbabilityPoint {
  t: number;           // timestamp (ms)
  yes: number;         // 0-100
}

export interface LeaderboardEntry {
  address: `0x${string}`;
  volume: bigint;
  betsCount: number;
  marketsCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function calcPayout(market: Market, pos: Position): bigint {
  const stake = market.outcome ? pos.yesAmount : pos.noAmount;
  if (stake === 0n) return 0n;
  const winPool = market.outcome ? market.yesPool : market.noPool;
  const losePool = market.outcome ? market.noPool : market.yesPool;
  if (losePool === 0n) return stake;
  return stake + (stake * losePool) / winPool;
}

function currentImpliedValue(market: Market, pos: Position): bigint {
  const total = market.yesPool + market.noPool;
  if (total === 0n) return pos.yesAmount + pos.noAmount;
  let val = 0n;
  if (market.yesPool > 0n && pos.yesAmount > 0n)
    val += (pos.yesAmount * total) / market.yesPool;
  if (market.noPool > 0n && pos.noAmount > 0n)
    val += (pos.noAmount * total) / market.noPool;
  return val;
}

// ─── useMarkets ───────────────────────────────────────────────────────────────
export function useMarkets(pageSize = 20) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [total, setTotal] = useState(0n);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const load = useCallback(async (from = 0n) => {
    setLoading(true);
    try {
      const [result, tot] = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: "getMarkets",
        args: [from, BigInt(pageSize)],
      }) as [readonly {
        question: string; imageUrl: string; endTime: bigint; resolver: `0x${string}`;
        resolved: boolean; outcome: boolean; yesPool: bigint; noPool: bigint;
      }[], bigint];
      setTotal(tot);
      setMarkets(result.map((m, i) => ({ ...m, id: from + BigInt(i) })));
    } catch (e) {
      console.error("getMarkets:", e);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    load(0n);
    intervalRef.current = setInterval(() => load(0n), 15_000);
    return () => clearInterval(intervalRef.current);
  }, [load]);

  return { markets, total, loading, refresh: () => load(0n) };
}

// ─── useMyPositions ───────────────────────────────────────────────────────────
export function useMyPositions(markets: Market[]) {
  const { address } = useAccount();
  const [positions, setPositions] = useState<PositionWithPnL[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!address || markets.length === 0) { setPositions([]); return; }
    setLoading(true);
    try {
      const results = await Promise.all(
        markets.map(async (market) => {
          const pos = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: PREDICTION_MARKET_ABI,
            functionName: "getPosition",
            args: [market.id, address],
          }) as Position;

          if (pos.yesAmount === 0n && pos.noAmount === 0n) return null;

          const invested = pos.yesAmount + pos.noAmount;
          let payout = 0n;
          let pnl = 0n;
          let pnlPercent = 0;
          let isWinner: boolean | null = null;

          if (market.resolved && !pos.claimed) {
            payout = calcPayout(market, pos);
            const wonSide = market.outcome ? pos.yesAmount > 0n : pos.noAmount > 0n;
            isWinner = wonSide && payout > 0n;
            pnl = isWinner ? payout - invested : -invested;
            pnlPercent = invested > 0n ? Number((pnl * 10000n) / invested) / 100 : 0;
          } else if (market.resolved && pos.claimed) {
            isWinner = market.outcome ? pos.yesAmount > 0n : pos.noAmount > 0n;
          } else {
            // Unrealized: implied current value
            const implied = currentImpliedValue(market, pos);
            pnl = implied - invested;
            pnlPercent = invested > 0n ? Number((pnl * 10000n) / invested) / 100 : 0;
          }

          return { ...pos, market, payout, invested, pnl, pnlPercent, isWinner };
        })
      );
      setPositions(results.filter(Boolean) as PositionWithPnL[]);
    } finally {
      setLoading(false);
    }
  }, [address, markets]);

  useEffect(() => { load(); }, [load]);

  return { positions, loading, refresh: load };
}

// ─── useProbabilityHistory ────────────────────────────────────────────────────
// Reconstructs YES% history by replaying BetPlaced events for a market.
export function useProbabilityHistory(marketId: bigint | null) {
  const [history, setHistory] = useState<ProbabilityPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (marketId === null) return;
    setLoading(true);

    (async () => {
      try {
        const latest = await publicClient.getBlockNumber();
        const from = latest > 200_000n ? latest - 200_000n : 0n;

        const logs = await publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          event: parseAbiItem(
            "event BetPlaced(uint256 indexed id, address indexed user, bool side, uint256 netAmount)"
          ),
          args: { id: marketId },
          fromBlock: from,
          toBlock: latest,
        });

        if (logs.length === 0) {
          setHistory([]);
          return;
        }

        // Fetch block timestamps in parallel (batch)
        const blocks = await Promise.all(
          logs.map((l) => publicClient.getBlock({ blockNumber: l.blockNumber! }))
        );

        let yesPool = 0n;
        let noPool = 0n;
        const points: ProbabilityPoint[] = [];

        for (let i = 0; i < logs.length; i++) {
          const args = logs[i].args as { side: boolean; netAmount: bigint };
          if (args.side) yesPool += args.netAmount;
          else noPool += args.netAmount;

          const total = yesPool + noPool;
          const yes = total > 0n ? Number((yesPool * 100n) / total) : 50;
          points.push({
            t: Number(blocks[i].timestamp) * 1000,
            yes,
          });
        }
        setHistory(points);
      } catch (e) {
        console.error("useProbabilityHistory:", e);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [marketId]);

  return { history, loading };
}

// ─── useLeaderboard ───────────────────────────────────────────────────────────
export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const latest = await publicClient.getBlockNumber();
        const from = latest > 45_000n ? latest - 45_000n : 0n;

        const logs = await publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          event: parseAbiItem(
            "event BetPlaced(uint256 indexed id, address indexed user, bool side, uint256 netAmount)"
          ),
          fromBlock: from,
          toBlock: latest,
        });

        const map = new Map<string, { volume: bigint; bets: number; markets: Set<bigint> }>();

        for (const log of logs) {
          const args = log.args as { id: bigint; user: `0x${string}`; netAmount: bigint };
          const key = args.user.toLowerCase();
          const existing = map.get(key) ?? { volume: 0n, bets: 0, markets: new Set<bigint>() };
          existing.volume += args.netAmount;
          existing.bets += 1;
          existing.markets.add(args.id);
          map.set(key, existing);
        }

        const sorted = [...map.entries()]
          .sort((a, b) => (b[1].volume > a[1].volume ? 1 : -1))
          .slice(0, 10)
          .map(([addr, data]) => ({
            address: addr as `0x${string}`,
            volume: data.volume,
            betsCount: data.bets,
            marketsCount: data.markets.size,
          }));

        setEntries(sorted);
      } catch (e) {
        console.error("useLeaderboard:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { entries, loading };
}

// ─── useUSDmBalance ───────────────────────────────────────────────────────────
export function useUSDmBalance() {
  const { address } = useAccount();
  const [balance, setBalance] = useState(0n);

  const load = useCallback(async () => {
    if (!address) return;
    try {
      const b = await publicClient.readContract({
        address: USDM_ADDRESS,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
      }) as bigint;
      setBalance(b);
    } catch {}
  }, [address]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  return balance;
}

// ─── usePreviewWin ────────────────────────────────────────────────────────────
export function usePreviewWin(marketId: bigint, side: boolean, amountUSD: string) {
  const [preview, setPreview] = useState({ payout: 0n, odds: 0n });

  useEffect(() => {
    if (!amountUSD || parseFloat(amountUSD) < 0.1) {
      setPreview({ payout: 0n, odds: 0n });
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const amount = parseUnits(amountUSD, 18);
        const [payout, odds] = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: PREDICTION_MARKET_ABI,
          functionName: "previewPotentialWin",
          args: [marketId, side, amount],
        }) as [bigint, bigint];
        setPreview({ payout, odds });
      } catch {
        setPreview({ payout: 0n, odds: 0n });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [marketId, side, amountUSD]);

  return preview;
}

// ─── Transaction helpers ──────────────────────────────────────────────────────
async function sendTx(
  walletClient: WalletClient,
  account: `0x${string}`,
  to: `0x${string}`,
  data: `0x${string}`
) {
  // @ts-expect-error feeCurrency is Celo CIP-64 — not yet in upstream viem types
  return walletClient.sendTransaction({ account, to, data, feeCurrency: USDM_FEE_CURRENCY });
}

async function ensureApproval(
  walletClient: WalletClient,
  account: `0x${string}`,
  amount: bigint
) {
  const allowance = await publicClient.readContract({
    address: USDM_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [account, CONTRACT_ADDRESS],
  }) as bigint;

  if (allowance >= amount) return;

  const data = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "approve",
    args: [CONTRACT_ADDRESS, amount * 2n], // approve 2x to avoid repeated approvals
  });
  const hash = await sendTx(walletClient, account, USDM_ADDRESS, data);
  await publicClient.waitForTransactionReceipt({ hash });
}

// ─── useMarketActions ─────────────────────────────────────────────────────────
export function useMarketActions() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [pending, setPending] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => { setError(null); setTxHash(null); };

  const placeBet = useCallback(async (marketId: bigint, side: boolean, amountStr: string) => {
    if (!address || !walletClient) { setError("Wallet not connected"); return false; }
    reset();
    setPending(true);
    try {
      const amount = parseUnits(amountStr, 18);
      await ensureApproval(walletClient, address, amount);
      const data = encodeFunctionData({
        abi: PREDICTION_MARKET_ABI,
        functionName: "placeBet",
        args: [marketId, side, amount],
      });
      const hash = await sendTx(walletClient, address, CONTRACT_ADDRESS, data);
      setTxHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      setError(msg.includes("insufficient") ? "Insufficient USDm balance" : msg.slice(0, 80));
      return false;
    } finally {
      setPending(false);
    }
  }, [address, walletClient]);

  const createMarket = useCallback(async (
    question: string,
    imageUrl: string,
    endTime: Date,
    resolver: `0x${string}`
  ) => {
    if (!address || !walletClient) { setError("Wallet not connected"); return false; }
    reset();
    setPending(true);
    try {
      const data = encodeFunctionData({
        abi: PREDICTION_MARKET_ABI,
        functionName: "createMarket",
        args: [question, imageUrl, BigInt(Math.floor(endTime.getTime() / 1000)), resolver],
      });
      const hash = await sendTx(walletClient, address, CONTRACT_ADDRESS, data);
      setTxHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message.slice(0, 80) : "Transaction failed");
      return false;
    } finally {
      setPending(false);
    }
  }, [address, walletClient]);

  const claimWinnings = useCallback(async (marketId: bigint) => {
    if (!address || !walletClient) return false;
    reset();
    setPending(true);
    try {
      const data = encodeFunctionData({
        abi: PREDICTION_MARKET_ABI,
        functionName: "claimWinnings",
        args: [marketId],
      });
      const hash = await sendTx(walletClient, address, CONTRACT_ADDRESS, data);
      setTxHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message.slice(0, 80) : "Transaction failed");
      return false;
    } finally {
      setPending(false);
    }
  }, [address, walletClient]);

  const resolveMarket = useCallback(async (marketId: bigint, outcome: boolean) => {
    if (!address || !walletClient) return false;
    reset();
    setPending(true);
    try {
      const data = encodeFunctionData({
        abi: PREDICTION_MARKET_ABI,
        functionName: "resolveMarket",
        args: [marketId, outcome],
      });
      const hash = await sendTx(walletClient, address, CONTRACT_ADDRESS, data);
      setTxHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message.slice(0, 80) : "Transaction failed");
      return false;
    } finally {
      setPending(false);
    }
  }, [address, walletClient]);

  return { placeBet, createMarket, claimWinnings, resolveMarket, pending, txHash, error, reset };
}
