"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { BetModal } from "@/components/BetModal";
import { CreateMarketModal } from "@/components/CreateMarketModal";
import { PredictionMarket } from "@/components/PredictionMarket";
import { useMarkets, type Market } from "@/hooks/usePredictionMarket";
import { formatUSDm, formatPercent, timeLeft } from "@/lib/clients";

function isMiniPay() {
  return typeof window !== "undefined" &&
    (window as { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay === true;
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

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ onLaunch }: { onLaunch: () => void }) {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0A0A14]/95 backdrop-blur border-b border-white/10" : ""}`}>
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#35D07F] to-[#FBCC5C] flex items-center justify-center">
            <span className="text-black font-black text-sm">◈</span>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            Celo<span className="text-[#35D07F]">Predict</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {!isMiniPay() && !isConnected && (
            <button onClick={() => connect({ connector: injected() })} className="px-4 py-2 text-sm font-medium rounded-xl border border-[#35D07F]/40 text-[#35D07F] hover:bg-[#35D07F]/10 transition-colors">
              Connect
            </button>
          )}
          <button onClick={onLaunch} className="px-5 py-2 text-sm font-semibold rounded-xl bg-[#35D07F] text-black hover:bg-[#35D07F]/90 transition-all active:scale-95">
            {isConnected ? `${address?.slice(0, 6)}…${address?.slice(-4)}` : "Launch App"}
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onLaunch, onCreate }: { onLaunch: () => void; onCreate: () => void }) {
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  function handleCTA() {
    if (isConnected || isMiniPay()) { onLaunch(); return; }
    connect({ connector: injected() });
  }
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#35D07F]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FBCC5C]/8 rounded-full blur-[80px]" />
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(#35D07F 1px, transparent 1px), linear-gradient(90deg, #35D07F 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#35D07F]/30 bg-[#35D07F]/10 text-[#35D07F] text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#35D07F] animate-pulse" />
          Live on Celo L2 · Fees paid in USDm · MiniPay ready
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight">
          Predict the future.<br />
          <span className="text-[#35D07F]">Win stablecoins.</span>
        </h1>
        <p className="text-[#8B8FA8] text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Decentralized binary prediction markets on Celo.
          Bet YES or NO on any event using USDm — no ETH, no CELO, no friction.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button onClick={handleCTA} className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-base bg-[#35D07F] text-black hover:bg-[#35D07F]/90 transition-all active:scale-95 shadow-lg shadow-[#35D07F]/25">
            {isConnected ? "Open App →" : "Start Predicting →"}
          </button>
          <button onClick={onCreate} className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-base border border-white/20 text-white hover:bg-white/5 transition-all active:scale-95">
            Create a Market
          </button>
        </div>
        <p className="text-xs text-[#3A3A54]">Non-custodial · Open-source · 2% protocol fee · No CELO needed</p>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#3A3A54] animate-bounce">
        <span className="text-xs">scroll</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function Stats({ totalMarkets }: { totalMarkets: number }) {
  return (
    <section className="py-12 border-y border-white/[0.05]">
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        {[
          { label: "Markets Created", value: totalMarkets, suffix: "+" },
          { label: "Network Fee", value: 0, suffix: " USDm" },
          { label: "Block Time", value: 1, suffix: "s" },
          { label: "Protocol Fee", value: 2, suffix: "%" },
        ].map((s) => (
          <div key={s.label} className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              <Counter to={s.value} suffix={s.suffix} />
            </p>
            <p className="text-xs text-[#5A5A78]">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Live Markets preview ─────────────────────────────────────────────────────
function LiveMarkets({ markets, onBet }: { markets: Market[]; onBet: (m: Market, side: boolean) => void }) {
  if (markets.length === 0) return null;
  return (
    <section className="py-16 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-[#35D07F] text-sm font-medium mb-2">Live now</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Open Markets</h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {markets.slice(0, 4).map((market) => {
          const total = market.yesPool + market.noPool;
          const yesPct = formatPercent(market.yesPool, market.noPool);
          const ended = Number(market.endTime) < Date.now() / 1000;
          return (
            <div key={String(market.id)} className="bg-[#10101C] border border-white/8 rounded-3xl p-5 flex flex-col gap-4 hover:border-[#35D07F]/25 transition-all group">
              <p className="text-white font-medium text-sm leading-snug line-clamp-2 group-hover:text-[#35D07F]/90 transition-colors">{market.question}</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#35D07F]">YES {yesPct}%</span>
                  <span className="text-[#E84040]">NO {100 - yesPct}%</span>
                </div>
                <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#35D07F] to-emerald-400" style={{ width: `${yesPct}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[#5A5A78]">
                <span>{formatUSDm(total)} USDm pool</span>
                <span className={ended ? "text-[#E84040]" : "text-[#FBCC5C]"}>
                  {market.resolved ? (market.outcome ? "✓ YES won" : "✗ NO won") : timeLeft(market.endTime)}
                </span>
              </div>
              {!market.resolved && !ended && (
                <div className="flex gap-2">
                  <button onClick={() => onBet(market, true)} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#35D07F]/12 text-[#35D07F] border border-[#35D07F]/20 hover:bg-[#35D07F]/20 transition-colors active:scale-95">Bet YES</button>
                  <button onClick={() => onBet(market, false)} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#E84040]/12 text-[#E84040] border border-[#E84040]/20 hover:bg-[#E84040]/20 transition-colors active:scale-95">Bet NO</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: "01", icon: "◈", title: "Connect your wallet", desc: "Use MiniPay or any EVM wallet. No ETH needed — network fees are paid automatically in USDm." },
    { n: "02", icon: "◎", title: "Pick a market", desc: "Browse open markets on crypto, sports, politics, or anything. Bet YES or NO with confidence." },
    { n: "03", icon: "◉", title: "Place your bet", desc: "Deposit USDm. Your stake goes into the YES or NO pool. Odds adjust in real-time with each bet." },
    { n: "04", icon: "✦", title: "Claim your winnings", desc: "When the market resolves, winners share the losing pool proportionally. Claim directly to your wallet." },
  ];
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#35D07F] text-sm font-medium mb-2">Simple by design</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">How it works</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {steps.map((s) => (
            <div key={s.n} className="relative bg-[#10101C] border border-white/8 rounded-3xl p-6 hover:border-[#35D07F]/20 transition-all group">
              <span className="absolute top-4 right-5 text-xs font-mono text-white/8 group-hover:text-[#35D07F]/20 transition-colors">{s.n}</span>
              <div className="text-3xl mb-4 text-[#35D07F]">{s.icon}</div>
              <h3 className="text-white font-semibold mb-2">{s.title}</h3>
              <p className="text-[#5A5A78] text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features() {
  const items = [
    { icon: "⚡", title: "~1s block time", desc: "Celo L2 confirms bets instantly. No waiting, no anxiety." },
    { icon: "💵", title: "Pay fees in USDm", desc: "CIP-64 fee abstraction. Zero CELO required, ever." },
    { icon: "📱", title: "MiniPay native", desc: "Auto-connect in MiniPay. Designed for 360×640 screens." },
    { icon: "📊", title: "Probability charts", desc: "Real on-chain history. See how odds evolved over time." },
    { icon: "⚖️", title: "Proportional payouts", desc: "Winners split the losing pool by stake share. Fair math." },
    { icon: "🔍", title: "Fully on-chain", desc: "No backend, no custody. Every bet lives in the contract." },
  ];
  return (
    <section className="py-20 px-4 bg-[#35D07F]/[0.02]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#FBCC5C] text-sm font-medium mb-2">Built on Celo</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Why CeloPredict?</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {items.map((f) => (
            <div key={f.title} className="bg-[#10101C] border border-white/8 rounded-2xl p-5 hover:border-[#35D07F]/20 transition-all">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-[#5A5A78] text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Bottom CTA ───────────────────────────────────────────────────────────────
function BottomCTA({ onLaunch, onCreate }: { onLaunch: () => void; onCreate: () => void }) {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#35D07F]/8 rounded-full blur-[100px]" />
      </div>
      <div className="relative max-w-xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to make your first prediction?</h2>
        <p className="text-[#5A5A78] text-sm">Join the prediction market on Celo. Fast, cheap, and fully on-chain.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={onLaunch} className="px-8 py-3.5 rounded-2xl font-bold text-base bg-[#35D07F] text-black hover:bg-[#35D07F]/90 transition-all active:scale-95 shadow-lg shadow-[#35D07F]/25">
            Browse Markets →
          </button>
          <button onClick={onCreate} className="px-8 py-3.5 rounded-2xl font-bold text-base border border-white/20 text-white hover:bg-white/5 transition-all active:scale-95">
            Create a Market
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/[0.05] py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#3A3A54]">
        <div className="flex items-center gap-2">
          <span className="text-[#35D07F]">◈</span>
          <span>CeloPredict — built on Celo L2</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://celoscan.io" target="_blank" rel="noopener noreferrer" className="hover:text-[#8B8FA8] transition-colors">Celoscan</a>
          <a href="https://docs.celo.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#8B8FA8] transition-colors">Docs</a>
          <span>Chain ID: 42220</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [view, setView] = useState<"landing" | "app">("landing");
  const [showCreate, setShowCreate] = useState(false);
  const [betState, setBetState] = useState<{ market: Market; side: boolean } | null>(null);
  const { markets, total } = useMarkets(4);

  // MiniPay users skip landing entirely
  useEffect(() => {
    if (isMiniPay()) setView("app");
  }, []);

  // Full app experience (bottom-nav + charts + leaderboard + my bets)
  if (view === "app") {
    return <PredictionMarket />;
  }

  // Landing page
  return (
    <div className="min-h-screen bg-[#0A0A14] text-white">
      <Nav onLaunch={() => setView("app")} />
      <Hero onLaunch={() => setView("app")} onCreate={() => setShowCreate(true)} />
      <Stats totalMarkets={Number(total)} />
      <LiveMarkets markets={markets} onBet={(m, side) => setBetState({ market: m, side })} />
      <HowItWorks />
      <Features />
      <BottomCTA onLaunch={() => setView("app")} onCreate={() => setShowCreate(true)} />
      <Footer />

      {betState && (
        <BetModal
          market={betState.market}
          initialSide={betState.side}
          onClose={() => setBetState(null)}
          onSuccess={() => setBetState(null)}
        />
      )}
      {showCreate && (
        <CreateMarketModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
