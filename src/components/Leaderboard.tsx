"use client";

import { useLeaderboard } from "@/hooks/usePredictionMarket";
import { formatUSDm } from "@/lib/clients";

const MEDALS = ["🥇", "🥈", "🥉"];

function Skeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="bg-white/[0.03] border border-white/5 rounded-2xl h-16 animate-pulse"
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
}

export function Leaderboard() {
  const { entries, loading } = useLeaderboard();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center py-2">
        <p className="text-[#FBCC5C] text-xs font-semibold uppercase tracking-widest mb-1">
          Top Traders
        </p>
        <p className="text-[#5A5A78] text-xs">Last ~12h on-chain activity</p>
      </div>

      {loading ? (
        <Skeleton />
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-[#5A5A78]">
          <p className="text-3xl mb-3">🏆</p>
          <p className="text-sm">No bets in the last 12 hours.</p>
          <p className="text-xs mt-1">Be the first on the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <div
              key={entry.address}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all ${
                i === 0
                  ? "bg-[#FBCC5C]/8 border-[#FBCC5C]/20"
                  : i === 1
                  ? "bg-white/[0.04] border-white/10"
                  : i === 2
                  ? "bg-white/[0.03] border-white/8"
                  : "bg-white/[0.02] border-white/5"
              }`}
            >
              {/* Rank */}
              <div className="w-8 text-center flex-shrink-0">
                {i < 3 ? (
                  <span className="text-xl">{MEDALS[i]}</span>
                ) : (
                  <span className="text-[#5A5A78] text-sm font-bold font-mono">
                    #{i + 1}
                  </span>
                )}
              </div>

              {/* Avatar + address */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{
                      background: `hsl(${Number("0x" + entry.address.slice(2, 6)) % 360}, 60%, 25%)`,
                      color: `hsl(${Number("0x" + entry.address.slice(2, 6)) % 360}, 80%, 75%)`,
                    }}
                  >
                    {entry.address.slice(2, 4).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-mono font-medium">
                      {entry.address.slice(0, 6)}…{entry.address.slice(-4)}
                    </p>
                    <p className="text-[#5A5A78] text-xs">
                      {entry.betsCount} bet{entry.betsCount !== 1 ? "s" : ""} ·{" "}
                      {entry.marketsCount} market{entry.marketsCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Volume */}
              <div className="text-right flex-shrink-0">
                <p className={`font-bold text-sm font-mono ${i === 0 ? "text-[#FBCC5C]" : "text-white"}`}>
                  {formatUSDm(entry.volume)}
                </p>
                <p className="text-[#5A5A78] text-xs">USDm</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-[#3A3A54] pt-2">
        Ranking by volume · Updates every session
      </p>
    </div>
  );
}
