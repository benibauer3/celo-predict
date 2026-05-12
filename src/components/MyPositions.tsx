"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import type { Market, Position } from "@/hooks/usePredictionMarket";
import { useMarketActions } from "@/hooks/usePredictionMarket";
import { CONTRACT_ADDRESS, PREDICTION_MARKET_ABI } from "@/lib/contract";
import { publicClient, formatUSDm } from "@/lib/clients";

interface PositionEntry {
  market: Market;
  position: Position;
  payout: bigint;
}

interface Props {
  markets: Market[];
  onRefresh: () => void;
}

export function MyPositions({ markets, onRefresh }: Props) {
  const { address } = useAccount();
  const [entries, setEntries] = useState<PositionEntry[]>([]);
  const { claimWinnings, resolveMarket, pending } = useMarketActions();

  useEffect(() => {
    if (!address || markets.length === 0) { setEntries([]); return; }

    Promise.all(
      markets.map(async (market) => {
        const pos = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: PREDICTION_MARKET_ABI,
          functionName: "getPosition",
          args: [market.id, address],
        }) as Position;

        if (pos.yesAmount === 0n && pos.noAmount === 0n) return null;

        let payout = 0n;
        if (market.resolved && !pos.claimed) {
          payout = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: PREDICTION_MARKET_ABI,
            functionName: "previewPayout",
            args: [market.id, address],
          }) as bigint;
        }

        return { market, position: pos, payout };
      })
    ).then((results) => {
      setEntries(results.filter(Boolean) as PositionEntry[]);
    });
  }, [address, markets]);

  if (!address || entries.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-1">
        My Positions
      </h2>
      {entries.map(({ market, position, payout }) => (
        <div
          key={String(market.id)}
          className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2"
        >
          <p className="text-white text-sm font-medium line-clamp-2">{market.question}</p>

          <div className="flex gap-4 text-xs text-gray-400">
            {position.yesAmount > 0n && (
              <span>
                YES: <span className="text-celo-green">{formatUSDm(position.yesAmount)} USDm</span>
              </span>
            )}
            {position.noAmount > 0n && (
              <span>
                NO: <span className="text-red-400">{formatUSDm(position.noAmount)} USDm</span>
              </span>
            )}
          </div>

          {market.resolved && !position.claimed && payout > 0n && (
            <button
              onClick={async () => { await claimWinnings(market.id); onRefresh(); }}
              disabled={pending}
              className="w-full py-2 rounded-xl text-sm font-semibold bg-celo-green text-black hover:bg-celo-green/90 transition-all active:scale-95 disabled:opacity-40"
            >
              {pending ? "Claiming…" : `Claim ${formatUSDm(payout)} USDm`}
            </button>
          )}

          {market.resolved && position.claimed && (
            <p className="text-xs text-gray-500 text-center">Claimed ✓</p>
          )}

          {/* Resolver: show resolve buttons if user is the resolver */}
          {!market.resolved &&
            Number(market.endTime) < Date.now() / 1000 &&
            address.toLowerCase() === market.resolver.toLowerCase() && (
              <div className="flex gap-2">
                <button
                  onClick={async () => { await resolveMarket(market.id, true); onRefresh(); }}
                  disabled={pending}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-celo-green/20 text-celo-green border border-celo-green/30 hover:bg-celo-green/30 transition-colors disabled:opacity-40"
                >
                  Resolve YES
                </button>
                <button
                  onClick={async () => { await resolveMarket(market.id, false); onRefresh(); }}
                  disabled={pending}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors disabled:opacity-40"
                >
                  Resolve NO
                </button>
              </div>
            )}
        </div>
      ))}
    </section>
  );
}
