"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

import { SparklesCursor }   from "@/components/uniforest/SparklesCursor";
import { UnicornLogo, UniforesWordmark } from "@/components/uniforest/UnicornLogo";
import { UnicornHeader }    from "@/components/uniforest/UnicornHeader";
import { MarketCard, MarketCardSkeleton } from "@/components/uniforest/MarketCard";
import { BettingDrawer }    from "@/components/uniforest/BettingDrawer";
import { CreateMarketModal } from "@/components/CreateMarketModal";

import {
  useMarkets,
  useMyPositions,
  useLeaderboard,
  type Market,
  type PositionWithPnL,
  type LeaderboardEntry,
} from "@/hooks/usePredictionMarket";
import { formatUSDm, timeLeft } from "@/lib/clients";

// ─── helpers ─────────────────────────────────────────────────────────────────
function isMiniPay() {
  return typeof window !== "undefined" &&
    (window as { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay === true;
}

function yesPercent(m: Market): number {
  const total = m.yesPool + m.noPool;
  if (total === 0n) return 50;
  return Math.round(Number((m.yesPool * 100n) / total));
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let frame = 0;
    const steps = 60;
    const timer = setInterval(() => {
      frame++;
      setVal(Math.round((to * frame) / steps));
      if (frame >= steps) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [to]);
  return <>{val.toLocaleString()}{suffix}</>;
}

// ══════════════════════════════════════════════════════════════════════════════
//  UNIFOREST APP (view = "app")
// ══════════════════════════════════════════════════════════════════════════════

type AppTab = "markets" | "positions" | "leaderboard";

function UniforesApp({ onCreateMarket }: { onCreateMarket: () => void }) {
  const [tab, setTab]             = useState<AppTab>("markets");
  const [search, setSearch]       = useState("");
  const [drawerMarket, setDrawerMarket] = useState<Market | null>(null);
  const [drawerSide, setDrawerSide]     = useState<"yes" | "no">("yes");

  const { markets, loading } = useMarkets(40);
  const { positions }        = useMyPositions(markets);
  const { entries: leaders, loading: lLoading } = useLeaderboard();

  const filtered = markets.filter(m =>
    m.question.toLowerCase().includes(search.toLowerCase())
  );

  function openBet(m: Market, side: "yes" | "no") {
    setDrawerMarket(m);
    setDrawerSide(side);
  }

  return (
    <div className="min-h-screen uniforest-bg pb-24">
      <UnicornHeader
        search={search}
        setSearch={setSearch}
        onCreateMarket={onCreateMarket}
      />

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 pt-4">
        <AnimatePresence mode="wait">
          {/* Markets tab */}
          {tab === "markets" && (
            <motion.div
              key="markets"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <MarketCardSkeleton key={i} index={i} />
                ))
              ) : filtered.length === 0 ? (
                <EmptyState search={search} />
              ) : (
                filtered.map((m, i) => (
                  <MarketCard
                    key={String(m.id)}
                    market={m}
                    index={i}
                    onBet={openBet}
                  />
                ))
              )}
            </motion.div>
          )}

          {/* My Positions tab */}
          {tab === "positions" && (
            <motion.div
              key="positions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <PositionsTab positions={positions} />
            </motion.div>
          )}

          {/* Leaderboard tab */}
          {tab === "leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <LeaderboardTab entries={leaders} loading={lLoading} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Bottom nav ──────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-gray-100">
        <div className="max-w-2xl mx-auto flex">
          {([
            { id: "markets",     label: "Markets",  icon: "🔮" },
            { id: "positions",   label: "My Bets",   icon: "💎" },
            { id: "leaderboard", label: "Leaderboard",   icon: "🏆" },
          ] as { id: AppTab; label: string; icon: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] font-semibold transition-colors ${
                tab === t.id ? "text-uniblue" : "text-gray-400"
              }`}
            >
              <span className="text-xl leading-none">{t.icon}</span>
              {t.label}
              {tab === t.id && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 h-0.5 w-8 rounded-full bg-uniblue"
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Betting Drawer ──────────────────────────────────────────── */}
      <BettingDrawer
        market={drawerMarket}
        initialSide={drawerSide}
        onClose={() => setDrawerMarket(null)}
      />
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ search }: { search: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16 space-y-3"
    >
      <div className="text-5xl">🦄</div>
      <p className="font-bold text-gray-600">
        {search ? `Nothing found for "${search}"` : "No open markets"}
      </p>
      <p className="text-sm text-gray-400">The unicorn is still on its way…</p>
    </motion.div>
  );
}

// ─── Positions tab ────────────────────────────────────────────────────────────
function PositionsTab({ positions }: { positions: PositionWithPnL[] }) {
  if (positions.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <div className="text-5xl">💎</div>
        <p className="font-bold text-gray-600">No bets yet</p>
        <p className="text-sm text-gray-400">Head to Markets and place your first bet!</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {positions.map((p, i) => {
        const pnlPos = p.pnl >= 0n;
        return (
          <motion.div
            key={String(p.market.id)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}
            className="bg-white rounded-3xl border border-gray-100 shadow-uni-card p-4 space-y-3"
          >
            <p className="text-sm font-semibold text-gray-800 line-clamp-2">{p.market.question}</p>
            <div className="flex gap-3">
              {p.yesAmount > 0n && (
                <div className="flex-1 bg-blue-50 rounded-xl px-3 py-2 text-center">
                  <div className="text-xs text-gray-500">YES</div>
                  <div className="text-sm font-bold text-uniblue">{formatUSDm(p.yesAmount)}</div>
                </div>
              )}
              {p.noAmount > 0n && (
                <div className="flex-1 bg-pink-50 rounded-xl px-3 py-2 text-center">
                  <div className="text-xs text-gray-500">NO</div>
                  <div className="text-sm font-bold text-unipink">{formatUSDm(p.noAmount)}</div>
                </div>
              )}
              <div className={`flex-1 rounded-xl px-3 py-2 text-center ${pnlPos ? "bg-green-50" : "bg-red-50"}`}>
                <div className="text-xs text-gray-500">P&L</div>
                <div className={`text-sm font-bold ${pnlPos ? "text-green-600" : "text-red-500"}`}>
                  {pnlPos ? "+" : ""}{formatUSDm(p.pnl)}
                </div>
              </div>
            </div>
            {p.market.resolved && !p.claimed && p.isWinner && (
              <div className="bg-gradient-to-r from-uniblue to-violet-500 text-white text-center text-xs font-bold rounded-2xl py-2">
                🎉 You won! Claim available
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Leaderboard tab ──────────────────────────────────────────────────────────
const MEDALS = ["🥇", "🥈", "🥉"];

function LeaderboardTab({ entries, loading }: { entries: LeaderboardEntry[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3 pt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-white rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <div className="text-5xl">🏆</div>
        <p className="font-bold text-gray-600">Leaderboard empty</p>
        <p className="text-sm text-gray-400">Place bets to appear here!</p>
      </div>
    );
  }
  return (
    <div className="space-y-2 pt-2">
      {entries.map((e, i) => {
        const hue = parseInt(e.address.slice(2, 8), 16) % 360;
        return (
          <motion.div
            key={e.address}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
            className="bg-white rounded-2xl border border-gray-100 shadow-uni-card px-4 py-3 flex items-center gap-3"
          >
            <span className="text-xl w-7 text-center flex-shrink-0">
              {i < 3 ? MEDALS[i] : <span className="text-xs text-gray-400 font-mono">#{i + 1}</span>}
            </span>
            <div
              className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
              style={{ background: `hsl(${hue}, 70%, 55%)` }}
            >
              {e.address.slice(2, 4).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-gray-700 truncate">
                {e.address.slice(0, 6)}…{e.address.slice(-4)}
              </p>
              <p className="text-[10px] text-gray-400">{e.betsCount} bets · {e.marketsCount} markets</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-black text-gray-800">{formatUSDm(e.volume)}</p>
              <p className="text-[10px] text-gray-400">USDm</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  UNIFOREST LANDING
// ══════════════════════════════════════════════════════════════════════════════

function LandingHero({ onLaunch }: { onLaunch: () => void }) {
  const { isConnected } = useAccount();
  const { connect }     = useConnect();
  const { markets, total } = useMarkets(4);

  function handleCTA() {
    if (isConnected || isMiniPay()) { onLaunch(); return; }
    connect({ connector: injected() });
  }

  return (
    <div className="min-h-screen uniforest-bg flex flex-col">
      {/* Landing nav */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UnicornLogo size={32} animated />
            <UniforesWordmark size="md" />
          </div>
          <div className="flex items-center gap-2">
            {!isMiniPay() && !isConnected && (
              <button
                onClick={() => connect({ connector: injected() })}
                className="px-4 py-2 text-sm font-bold rounded-xl border border-uniblue/30 text-uniblue hover:bg-uniblue/5 transition-colors"
              >
                Connect
              </button>
            )}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCTA}
              className="px-4 py-2 text-sm font-black rounded-xl text-white shadow-uni-blue"
              style={{ background: "linear-gradient(135deg, #007AFF, #8B5CF6)" }}
            >
              {isConnected ? "Open App →" : "Get Started →"}
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center relative overflow-hidden">
        {/* BG blobs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-100 rounded-full blur-[80px] opacity-50 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-pink-100 rounded-full blur-[60px] opacity-50 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-2xl space-y-6"
        >
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <UnicornLogo size={80} animated />
          </div>

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-uniblue/20 text-uniblue text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-uniblue animate-pulse" />
            Live on Celo · Rewards in USDm &amp; USDT · MiniPay ready
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-800 leading-tight tracking-tight">
            Predict the future.<br />
            <span className="uni-gradient-text">Earn USDm & USDT.</span>
          </h1>

          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Binary prediction markets on Celo. Bet YES or NO on any event —
            stakes and winnings are always in <strong className="text-gray-700">USDm</strong> or{" "}
            <strong className="text-gray-700">USDT</strong>. No ETH, no CELO, no friction.
          </p>

          {/* Token badges */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <span className="text-lg">💵</span>
              <div className="text-left">
                <p className="text-xs font-black text-gray-800">USDm</p>
                <p className="text-[10px] text-gray-400">Mento Dollar</p>
              </div>
            </div>
            <span className="text-gray-300 font-bold">+</span>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <span className="text-lg">💲</span>
              <div className="text-left">
                <p className="text-xs font-black text-gray-800">USDT</p>
                <p className="text-[10px] text-gray-400">Tether USD</p>
              </div>
            </div>
            <span className="text-gray-300 font-bold">=</span>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-pink-50 border border-uniblue/20 rounded-2xl shadow-sm">
              <span className="text-lg">🦄</span>
              <div className="text-left">
                <p className="text-xs font-black uni-gradient-text">Your wins</p>
                <p className="text-[10px] text-gray-400">paid out instantly</p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleCTA}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base text-white shadow-uni-blue"
              style={{ background: "linear-gradient(135deg, #007AFF, #8B5CF6, #FF007A)" }}
            >
              {isConnected ? "Open Markets →" : "Start Predicting →"}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onLaunch}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-gray-700 border-2 border-gray-200 hover:border-uniblue/30 transition-colors"
            >
              Browse Markets 🔮
            </motion.button>
          </div>

          <p className="text-xs text-gray-400">
            Non-custodial · Open-source · 2% protocol fee · Rewards in USDm & USDT
          </p>
        </motion.div>
      </section>

      {/* Stats strip */}
      <section className="border-t border-gray-100 bg-white/60 backdrop-blur py-8">
        <div className="max-w-3xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { label: "Markets created",  value: Number(total), suffix: "+" },
            { label: "Network fee",      value: 0,             suffix: " USDm" },
            { label: "Block time",       value: 1,             suffix: "s" },
            { label: "Protocol fee",     value: 2,             suffix: "%" },
          ].map(s => (
            <div key={s.label} className="space-y-1">
              <p className="text-2xl font-extrabold uni-gradient-text">
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live markets preview */}
      {markets.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-uniblue text-sm font-semibold mb-1">Live now</p>
              <h2 className="text-2xl font-black text-gray-800">Open Markets</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {markets.slice(0, 4).map((m, i) => (
                <MarketCard
                  key={String(m.id)}
                  market={m}
                  index={i}
                  onBet={() => onLaunch()}
                />
              ))}
            </div>
            <div className="text-center mt-8">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onLaunch}
                className="px-8 py-3.5 rounded-2xl font-black text-white shadow-uni-blue"
                style={{ background: "linear-gradient(135deg, #007AFF, #8B5CF6)" }}
              >
                See all markets →
              </motion.button>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-16 px-4 bg-white/40 backdrop-blur border-y border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-unipink text-sm font-semibold mb-1">Simple & magical</p>
            <h2 className="text-2xl font-black text-gray-800">How it works</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: "🦄", step: "01", title: "Connect your wallet",   desc: "Use MiniPay or any EVM wallet. Gas fees are paid automatically in USDm — no CELO needed." },
              { icon: "🔮", step: "02", title: "Pick a market",         desc: "Browse markets on crypto, sports, politics, or any event you care about." },
              { icon: "💎", step: "03", title: "Bet YES or NO",         desc: "Stake USDm or USDT. Your bet goes into the YES or NO pool. Odds update in real time with every new bet." },
              { icon: "✨", step: "04", title: "Claim your rewards",    desc: "Winners receive their original stake plus a share of the losing pool — paid out in USDm or USDT, instantly on-chain." },
            ].map(s => (
              <motion.div
                key={s.step}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-uni-card p-5 relative overflow-hidden"
              >
                <span className="absolute top-3 right-4 text-xs font-mono text-gray-100 font-black text-2xl">{s.step}</span>
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-black text-gray-800 mb-1.5">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-violet-500 text-sm font-semibold mb-1">Built on Celo</p>
            <h2 className="text-2xl font-black text-gray-800">Why Uniforest?</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: "⚡", title: "~1s block time",         desc: "Bets confirmed instantly on Celo L2." },
              { icon: "💵", title: "USDm & USDT rewards", desc: "All winnings paid in stablecoins. No price risk on your rewards." },
              { icon: "📱", title: "MiniPay native",      desc: "Auto-connect in MiniPay. Designed for mobile-first users." },
              { icon: "📊", title: "On-chain charts",     desc: "Real probability history from on-chain events." },
              { icon: "⚖️", title: "Fair payouts",        desc: "Winners split the losing pool proportionally. Clean, transparent math." },
              { icon: "🔍", title: "100% on-chain",       desc: "No backend, no custody. Every bet and reward lives in the contract." },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-100 shadow-uni-card p-4">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{f.title}</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards callout */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 via-white to-pink-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-uniblue text-sm font-semibold">Stablecoin rewards</p>
          <h2 className="text-2xl font-black text-gray-800">
            Your winnings. Always in stablecoins.
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
            Every payout on Uniforest is settled in{" "}
            <strong className="text-gray-800">USDm</strong> or{" "}
            <strong className="text-gray-800">USDT</strong> — no volatile tokens, no slippage surprises.
            What you win is exactly what lands in your wallet.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {[
              { token: "USDm", sub: "Mento Dollar · native to Celo", color: "from-uniblue to-blue-400", emoji: "💵" },
              { token: "USDT", sub: "Tether USD · widely accepted",  color: "from-unipink to-pink-400", emoji: "💲" },
            ].map(t => (
              <div key={t.token} className="flex-1 max-w-[220px] bg-white rounded-3xl border border-gray-100 shadow-uni-card p-5 text-center space-y-2">
                <div className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-2xl`}>
                  {t.emoji}
                </div>
                <p className="text-lg font-black text-gray-800">{t.token}</p>
                <p className="text-[11px] text-gray-400 leading-snug">{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-t from-blue-50 to-transparent" />
        </div>
        <div className="relative max-w-lg mx-auto space-y-5">
          <div className="text-5xl">🦄✨</div>
          <h2 className="text-3xl font-extrabold text-gray-800">Ready to earn your first USDm reward?</h2>
          <p className="text-gray-500 text-sm">Join Uniforest. Predict, win, and get paid in stablecoins.</p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleCTA}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-base text-white shadow-uni-blue"
            style={{ background: "linear-gradient(135deg, #007AFF, #8B5CF6, #FF007A)" }}
          >
            {isConnected ? "Open Markets →" : "Get Started →"}
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="uni-gradient-text font-black">Uniforest</span>
            <span>— built on Celo L2</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://celoscan.io" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">Celoscan</a>
            <a href="https://docs.celo.org" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">Docs</a>
            <span>Chain ID: 42220</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const [view, setView]           = useState<"landing" | "app">("landing");
  const [showCreate, setShowCreate] = useState(false);

  // MiniPay users skip landing entirely
  useEffect(() => {
    if (isMiniPay()) setView("app");
  }, []);

  return (
    <>
      <SparklesCursor />

      {view === "app" ? (
        <UniforesApp onCreateMarket={() => setShowCreate(true)} />
      ) : (
        <LandingHero onLaunch={() => setView("app")} />
      )}

      {showCreate && (
        <CreateMarketModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => setShowCreate(false)}
        />
      )}
    </>
  );
}
