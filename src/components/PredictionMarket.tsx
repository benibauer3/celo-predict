"use client";

import { useState, useMemo } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import dynamic from "next/dynamic";
import type { Market } from "@/hooks/usePredictionMarket";
import {
  useMarkets,
  useMyPositions,
  useMarketActions,
  useUSDmBalance,
  useProbabilityHistory,
} from "@/hooks/usePredictionMarket";
import { BetModal } from "./BetModal";
import { CreateMarketModal } from "./CreateMarketModal";
import { Leaderboard } from "./Leaderboard";
import { formatUSDm, formatPercent, timeLeft } from "@/lib/clients";

// recharts must be dynamic (browser-only)
const ProbabilityChart = dynamic(
  () => import("./ProbabilityChart").then((m) => m.ProbabilityChart),
  { ssr: false }
);

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "markets" | "mybets" | "leaderboard";
type Filter = "open" | "resolved" | "all";

// ─── Detect MiniPay ───────────────────────────────────────────────────────────
function isMiniPay() {
  return typeof window !== "undefined" &&
    (window as { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay === true;
}

// ─── AppHeader ────────────────────────────────────────────────────────────────
function AppHeader({ onCreateMarket }: { onCreateMarket: () => void }) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const balance = useUSDmBalance();

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A14]/95 backdrop-blur border-b border-white/[0.06] safe-top">
      <div className="flex items-center justify-between px-4 h-[60px]">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#35D07F] to-[#FBCC5C] flex items-center justify-center">
            <span className="text-black font-black text-sm">◈</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">CeloPredict</p>
            <p className="text-[#35D07F] text-[10px] leading-tight">Celo L2 · USDm</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isConnected && address ? (
            <>
              {/* Balance chip */}
              <div className="hidden sm:flex items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-full px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#35D07F]" />
                <span className="text-white text-xs font-mono font-medium">
                  {formatUSDm(balance)} USDm
                </span>
              </div>

              {/* Create button */}
              <button
                onClick={onCreateMarket}
                className="w-9 h-9 rounded-xl bg-[#35D07F]/20 border border-[#35D07F]/30 text-[#35D07F] text-xl flex items-center justify-center hover:bg-[#35D07F]/30 transition-colors active:scale-95"
              >
                +
              </button>

              {/* Address (not in MiniPay) */}
              {!isMiniPay() && (
                <button
                  onClick={() => disconnect()}
                  className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/10 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FBCC5C]" />
                  <span className="text-white text-xs font-mono">
                    {address.slice(0, 6)}…{address.slice(-4)}
                  </span>
                </button>
              )}
            </>
          ) : !isMiniPay() ? (
            <button
              onClick={() => connect({ connector: injected() })}
              className="px-4 py-2 rounded-xl bg-[#35D07F] text-black text-sm font-bold hover:bg-[#35D07F]/90 transition-all active:scale-95"
            >
              Connect
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

// ─── BottomNav ────────────────────────────────────────────────────────────────
function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "markets", label: "Markets", icon: "🔥" },
    { id: "mybets", label: "My Bets", icon: "📊" },
    { id: "leaderboard", label: "Top", icon: "🏆" },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#0A0A14]/95 backdrop-blur border-t border-white/[0.06] pb-safe">
      <div className="flex max-w-md mx-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all ${
              tab === t.id ? "text-[#35D07F]" : "text-[#5A5A78] hover:text-white"
            }`}
          >
            <span className="text-xl">{t.icon}</span>
            <span className={`text-[10px] font-semibold ${tab === t.id ? "text-[#35D07F]" : ""}`}>
              {t.label}
            </span>
            {tab === t.id && (
              <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-[#35D07F]" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-4 space-y-4 animate-pulse">
      <div className="h-4 bg-white/10 rounded-full w-4/5" />
      <div className="h-3 bg-white/10 rounded-full w-3/5" />
      <div className="h-8 bg-white/5 rounded-xl" />
      <div className="flex gap-2">
        <div className="flex-1 h-12 bg-white/5 rounded-2xl" />
        <div className="flex-1 h-12 bg-white/5 rounded-2xl" />
      </div>
    </div>
  );
}

// ─── MarketDetail — expanded view ─────────────────────────────────────────────
function MarketDetail({
  market,
  onBet,
  onClose,
  isResolver,
}: {
  market: Market;
  onBet: (side: boolean) => void;
  onClose: () => void;
  isResolver: boolean;
}) {
  const { history } = useProbabilityHistory(market.id);
  const { resolveMarket, pending } = useMarketActions();
  const total = market.yesPool + market.noPool;
  const yesPct = formatPercent(market.yesPool, market.noPool);
  const ended = Number(market.endTime) < Date.now() / 1000;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-[#10101C] border border-white/8 rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-5 pt-4 pb-8 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-white font-semibold leading-snug">{market.question}</p>
            <button onClick={onClose} className="text-[#5A5A78] hover:text-white text-xl flex-shrink-0">✕</button>
          </div>

          {/* Pools */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#35D07F]/8 border border-[#35D07F]/20 rounded-2xl p-4 text-center">
              <p className="text-[#35D07F] text-2xl font-black">{yesPct}%</p>
              <p className="text-[#35D07F] text-xs mt-1">YES</p>
              <p className="text-white/60 text-xs mt-1 font-mono">{formatUSDm(market.yesPool)} USDm</p>
            </div>
            <div className="bg-[#E84040]/8 border border-[#E84040]/20 rounded-2xl p-4 text-center">
              <p className="text-[#E84040] text-2xl font-black">{100 - yesPct}%</p>
              <p className="text-[#E84040] text-xs mt-1">NO</p>
              <p className="text-white/60 text-xs mt-1 font-mono">{formatUSDm(market.noPool)} USDm</p>
            </div>
          </div>

          {/* Chart */}
          <div>
            <p className="text-[#5A5A78] text-xs mb-2">Probability history (from on-chain events)</p>
            {history.length > 1
              ? <ProbabilityChart history={history} height={140} />
              : <p className="text-[#3A3A54] text-xs py-8 text-center">No bets placed yet</p>
            }
          </div>

          {/* Meta */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl divide-y divide-white/5">
            {[
              ["Total volume", `${formatUSDm(total)} USDm`],
              ["Status", market.resolved ? (market.outcome ? "✓ YES won" : "✗ NO won") : ended ? "Awaiting resolution" : timeLeft(market.endTime)],
              ["Resolver", `${market.resolver.slice(0, 10)}…`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between px-4 py-3 text-sm">
                <span className="text-[#8B8FA8]">{k}</span>
                <span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>

          {/* Resolver actions */}
          {isResolver && !market.resolved && ended && (
            <div className="space-y-2">
              <p className="text-[#FBCC5C] text-xs font-semibold">You are the resolver</p>
              <div className="flex gap-2">
                <button
                  onClick={() => resolveMarket(market.id, true)}
                  disabled={pending}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm bg-[#35D07F]/20 text-[#35D07F] border border-[#35D07F]/30 hover:bg-[#35D07F]/30 transition-colors disabled:opacity-40 active:scale-95"
                >
                  {pending ? "…" : "Resolve YES"}
                </button>
                <button
                  onClick={() => resolveMarket(market.id, false)}
                  disabled={pending}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm bg-[#E84040]/20 text-[#E84040] border border-[#E84040]/30 hover:bg-[#E84040]/30 transition-colors disabled:opacity-40 active:scale-95"
                >
                  {pending ? "…" : "Resolve NO"}
                </button>
              </div>
            </div>
          )}

          {/* Bet buttons */}
          {!market.resolved && !ended && (
            <div className="flex gap-3">
              <button
                onClick={() => onBet(true)}
                className="flex-1 py-4 rounded-2xl font-bold text-sm bg-[#35D07F] text-black hover:bg-[#35D07F]/90 shadow-lg shadow-[#35D07F]/20 transition-all active:scale-95"
              >
                Bet YES {yesPct}%
              </button>
              <button
                onClick={() => onBet(false)}
                className="flex-1 py-4 rounded-2xl font-bold text-sm bg-[#E84040] text-white hover:bg-[#E84040]/90 shadow-lg shadow-[#E84040]/20 transition-all active:scale-95"
              >
                Bet NO {100 - yesPct}%
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MarketCard ───────────────────────────────────────────────────────────────
function MarketCard({
  market,
  onBet,
  onDetail,
}: {
  market: Market;
  onBet: (side: boolean) => void;
  onDetail: () => void;
}) {
  const total = market.yesPool + market.noPool;
  const yesPct = formatPercent(market.yesPool, market.noPool);
  const noPct = 100 - yesPct;
  const ended = Number(market.endTime) < Date.now() / 1000;

  return (
    <div className="bg-[#10101C] border border-white/[0.07] rounded-3xl p-4 space-y-3 hover:border-[#35D07F]/20 transition-all active:scale-[0.99]">
      {/* Question */}
      <button
        onClick={onDetail}
        className="text-left w-full"
      >
        <p className="text-white font-semibold text-sm leading-snug line-clamp-2 hover:text-[#35D07F] transition-colors">
          {market.question}
        </p>
      </button>

      {/* Probability bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-[#35D07F]">YES {yesPct}%</span>
          <span className="text-[#E84040]">NO {noPct}%</span>
        </div>
        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#35D07F] to-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${yesPct}%` }}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[#5A5A78] text-xs">Vol:</span>
          <span className="text-white text-xs font-mono font-medium">
            {formatUSDm(total)} USDm
          </span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          market.resolved
            ? "bg-white/5 text-[#8B8FA8]"
            : ended
            ? "bg-[#FBCC5C]/10 text-[#FBCC5C]"
            : "bg-[#35D07F]/10 text-[#35D07F]"
        }`}>
          {market.resolved
            ? market.outcome ? "✓ YES" : "✗ NO"
            : ended
            ? "Resolving…"
            : timeLeft(market.endTime)}
        </span>
      </div>

      {/* Action buttons */}
      {!market.resolved && !ended ? (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onBet(true)}
            className="flex-1 py-3 rounded-2xl text-sm font-bold bg-[#35D07F]/12 text-[#35D07F] border border-[#35D07F]/20 hover:bg-[#35D07F]/20 hover:shadow-lg hover:shadow-[#35D07F]/10 transition-all active:scale-95"
          >
            Bet YES
          </button>
          <button
            onClick={() => onBet(false)}
            className="flex-1 py-3 rounded-2xl text-sm font-bold bg-[#E84040]/12 text-[#E84040] border border-[#E84040]/20 hover:bg-[#E84040]/20 hover:shadow-lg hover:shadow-[#E84040]/10 transition-all active:scale-95"
          >
            Bet NO
          </button>
        </div>
      ) : (
        <button
          onClick={onDetail}
          className="w-full py-3 rounded-2xl text-sm font-medium text-[#8B8FA8] border border-white/8 hover:bg-white/5 transition-all active:scale-95"
        >
          View details →
        </button>
      )}
    </div>
  );
}

// ─── MarketsTab ───────────────────────────────────────────────────────────────
function MarketsTab({
  markets,
  loading,
  onBet,
}: {
  markets: Market[];
  loading: boolean;
  onBet: (market: Market, side: boolean) => void;
}) {
  const [filter, setFilter] = useState<Filter>("open");
  const [search, setSearch] = useState("");
  const [detailMarket, setDetailMarket] = useState<Market | null>(null);
  const { address } = useAccount();

  const filtered = useMemo(() =>
    markets.filter((m) => {
      const ended = Number(m.endTime) < Date.now() / 1000;
      const matchFilter =
        filter === "all" ? true :
        filter === "open" ? !ended && !m.resolved :
        m.resolved || ended;
      const matchSearch = !search || m.question.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    }),
  [markets, filter, search]);

  return (
    <>
      {/* Search */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A5A78] text-sm">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search markets…"
          className="w-full bg-white/[0.04] border border-white/8 rounded-2xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-[#35D07F]/30 transition-colors placeholder:text-[#5A5A78]"
        />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {(["open", "resolved", "all"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all ${
              filter === f
                ? "bg-[#35D07F] text-black shadow-lg shadow-[#35D07F]/20"
                : "bg-white/5 text-[#8B8FA8] border border-white/8 hover:bg-white/10"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Market list */}
      {loading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[#5A5A78]">
          <p className="text-4xl mb-3">◈</p>
          <p className="text-sm">{search ? "No markets match your search." : "No markets in this category."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((market) => (
            <MarketCard
              key={String(market.id)}
              market={market}
              onBet={(side) => onBet(market, side)}
              onDetail={() => setDetailMarket(market)}
            />
          ))}
        </div>
      )}

      {detailMarket && (
        <MarketDetail
          market={detailMarket}
          onBet={(side) => { setDetailMarket(null); onBet(detailMarket, side); }}
          onClose={() => setDetailMarket(null)}
          isResolver={address?.toLowerCase() === detailMarket.resolver.toLowerCase()}
        />
      )}
    </>
  );
}

// ─── MyBetsTab ────────────────────────────────────────────────────────────────
function MyBetsTab({ markets, onRefresh }: { markets: Market[]; onRefresh: () => void }) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { positions, loading } = useMyPositions(markets);
  const { claimWinnings, pending } = useMarketActions();

  const totalInvested = positions.reduce((a, p) => a + p.invested, 0n);
  const totalPnL = positions.reduce((a, p) => a + p.pnl, 0n);
  const claimable = positions.filter(
    (p) => p.market.resolved && !p.claimed && p.payout > 0n
  );

  if (!isConnected) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-4xl">📊</p>
        <p className="text-white font-semibold">Connect to see your bets</p>
        <button
          onClick={() => connect({ connector: injected() })}
          className="px-6 py-3 rounded-2xl bg-[#35D07F] text-black font-bold text-sm hover:bg-[#35D07F]/90 transition-all active:scale-95"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="text-center py-24 space-y-2 text-[#5A5A78]">
        <p className="text-4xl">📊</p>
        <p className="text-sm text-white font-semibold">No positions yet</p>
        <p className="text-xs">Place your first bet to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Portfolio summary */}
      <div className="bg-[#10101C] border border-white/8 rounded-3xl p-5">
        <p className="text-[#8B8FA8] text-xs mb-3 uppercase tracking-wider">Portfolio</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-white font-bold font-mono">{formatUSDm(totalInvested)}</p>
            <p className="text-[#5A5A78] text-xs mt-0.5">Invested</p>
          </div>
          <div>
            <p className={`font-bold font-mono ${totalPnL >= 0n ? "text-[#35D07F]" : "text-[#E84040]"}`}>
              {totalPnL >= 0n ? "+" : ""}{formatUSDm(totalPnL)}
            </p>
            <p className="text-[#5A5A78] text-xs mt-0.5">P&L</p>
          </div>
          <div>
            <p className="text-[#FBCC5C] font-bold font-mono">{claimable.length}</p>
            <p className="text-[#5A5A78] text-xs mt-0.5">To claim</p>
          </div>
        </div>
        {address && (
          <p className="text-[#3A3A54] text-xs text-center mt-3 font-mono">
            {address.slice(0, 8)}…{address.slice(-6)}
          </p>
        )}
      </div>

      {/* Positions list */}
      {positions.map(({ market, invested, pnl, pnlPercent, payout, isWinner, yesAmount, noAmount, claimed }) => (
        <div
          key={String(market.id)}
          className={`bg-[#10101C] border rounded-3xl p-4 space-y-3 ${
            isWinner === true
              ? "border-[#35D07F]/25"
              : isWinner === false
              ? "border-[#E84040]/25"
              : "border-white/[0.07]"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-white font-medium text-sm leading-snug line-clamp-2">{market.question}</p>
            <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
              market.resolved
                ? isWinner
                  ? "bg-[#35D07F]/15 text-[#35D07F]"
                  : "bg-[#E84040]/15 text-[#E84040]"
                : "bg-[#FBCC5C]/10 text-[#FBCC5C]"
            }`}>
              {market.resolved ? (isWinner ? "Won" : "Lost") : "Active"}
            </span>
          </div>

          {/* Bet breakdown */}
          <div className="flex gap-2">
            {yesAmount > 0n && (
              <div className="flex-1 bg-[#35D07F]/8 border border-[#35D07F]/15 rounded-2xl px-3 py-2 text-center">
                <p className="text-[#35D07F] text-xs font-bold">YES</p>
                <p className="text-white text-sm font-mono mt-0.5">{formatUSDm(yesAmount)}</p>
              </div>
            )}
            {noAmount > 0n && (
              <div className="flex-1 bg-[#E84040]/8 border border-[#E84040]/15 rounded-2xl px-3 py-2 text-center">
                <p className="text-[#E84040] text-xs font-bold">NO</p>
                <p className="text-white text-sm font-mono mt-0.5">{formatUSDm(noAmount)}</p>
              </div>
            )}
            <div className="flex-1 bg-white/[0.04] border border-white/8 rounded-2xl px-3 py-2 text-center">
              <p className="text-[#8B8FA8] text-xs">P&L</p>
              <p className={`text-sm font-bold font-mono mt-0.5 ${pnl >= 0n ? "text-[#35D07F]" : "text-[#E84040]"}`}>
                {pnl >= 0n ? "+" : ""}{formatUSDm(pnl)}
              </p>
              <p className={`text-[10px] ${pnl >= 0n ? "text-[#35D07F]/70" : "text-[#E84040]/70"}`}>
                {pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Claim button */}
          {market.resolved && !claimed && payout > 0n && (
            <button
              onClick={async () => {
                const ok = await claimWinnings(market.id);
                if (ok) onRefresh();
              }}
              disabled={pending}
              className="w-full py-3.5 rounded-2xl font-bold text-sm bg-[#35D07F] text-black hover:bg-[#35D07F]/90 shadow-lg shadow-[#35D07F]/20 transition-all active:scale-95 disabled:opacity-40"
            >
              {pending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Claiming…
                </span>
              ) : (
                `Claim ${formatUSDm(payout)} USDm`
              )}
            </button>
          )}
          {market.resolved && claimed && (
            <p className="text-center text-xs text-[#3A3A54]">Claimed ✓</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── PredictionMarket (root component) ───────────────────────────────────────
export function PredictionMarket() {
  const [tab, setTab] = useState<Tab>("markets");
  const [betState, setBetState] = useState<{ market: Market; side: boolean } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const { markets, loading, refresh } = useMarkets(50);

  return (
    <div className="min-h-screen bg-[#0A0A14] max-w-md mx-auto relative">
      <AppHeader onCreateMarket={() => setShowCreate(true)} />

      <main className="px-4 pt-5 pb-28 space-y-4">
        {tab === "markets" && (
          <MarketsTab
            markets={markets}
            loading={loading}
            onBet={(market, side) => setBetState({ market, side })}
          />
        )}
        {tab === "mybets" && (
          <MyBetsTab markets={markets} onRefresh={refresh} />
        )}
        {tab === "leaderboard" && <Leaderboard />}
      </main>

      <BottomNav tab={tab} setTab={setTab} />

      {/* Floating create button (only on markets tab on mobile) */}
      {tab === "markets" && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-24 right-4 sm:right-8 w-14 h-14 rounded-full bg-[#35D07F] text-black text-2xl font-bold shadow-xl shadow-[#35D07F]/30 flex items-center justify-center hover:bg-[#35D07F]/90 transition-all active:scale-95 z-30"
        >
          +
        </button>
      )}

      {betState && (
        <BetModal
          market={betState.market}
          initialSide={betState.side}
          onClose={() => setBetState(null)}
          onSuccess={() => { setBetState(null); refresh(); }}
        />
      )}
      {showCreate && (
        <CreateMarketModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); refresh(); }}
        />
      )}
    </div>
  );
}
