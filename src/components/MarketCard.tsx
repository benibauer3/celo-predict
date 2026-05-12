"use client";

import type { Market } from "@/hooks/usePredictionMarket";
import { formatUSDm, formatPercent, timeLeft } from "@/lib/clients";

interface Props {
  market: Market;
  onBet: (market: Market, side: boolean) => void;
}

export function MarketCard({ market, onBet }: Props) {
  const total = market.yesPool + market.noPool;
  const yesPct = formatPercent(market.yesPool, market.noPool);
  const noPct = 100 - yesPct;
  const ended = Number(market.endTime) < Date.now() / 1000;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 hover:border-white/20 transition-all">
      {/* Question */}
      <p className="text-white font-medium text-sm leading-snug line-clamp-3">
        {market.question}
      </p>

      {/* Pool bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-400">
          <span className="text-celo-green font-semibold">YES {yesPct}%</span>
          <span className="text-red-400 font-semibold">NO {noPct}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-celo-green to-emerald-400 transition-all duration-500"
            style={{ width: `${yesPct}%` }}
          />
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          Volume:{" "}
          <span className="text-gray-300">{formatUSDm(total)} USDm</span>
        </span>
        <span className={ended ? "text-red-400" : "text-yellow-400"}>
          {market.resolved
            ? market.outcome
              ? "✓ YES won"
              : "✗ NO won"
            : timeLeft(market.endTime)}
        </span>
      </div>

      {/* Action buttons */}
      {!market.resolved && !ended ? (
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => onBet(market, true)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold bg-celo-green/20 text-celo-green border border-celo-green/30 hover:bg-celo-green/30 transition-colors active:scale-95"
          >
            Bet YES
          </button>
          <button
            onClick={() => onBet(market, false)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors active:scale-95"
          >
            Bet NO
          </button>
        </div>
      ) : market.resolved ? (
        <div className="text-center text-xs text-gray-500 mt-1">
          Market resolved — check your positions
        </div>
      ) : (
        <div className="text-center text-xs text-gray-500 mt-1">
          Betting closed — awaiting resolution
        </div>
      )}
    </div>
  );
}
