"use client";

import { motion } from "framer-motion";
import { type Market } from "@/hooks/usePredictionMarket";
import { formatUSDm, timeLeft } from "@/lib/clients";

interface Props {
  market: Market;
  index?: number;
  onBet: (market: Market, side: "yes" | "no") => void;
}

function yesPercent(m: Market): number {
  const total = m.yesPool + m.noPool;
  if (total === 0n) return 50;
  return Math.round(Number((m.yesPool * 100n) / total));
}

const cardVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" as const },
  }),
};

export function MarketCard({ market, index = 0, onBet }: Props) {
  const pct    = yesPercent(market);
  const total  = market.yesPool + market.noPool;
  const tLeft  = timeLeft(market.endTime);
  const isOver = market.resolved || market.endTime < BigInt(Math.floor(Date.now() / 1000));

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="bg-white rounded-3xl border border-gray-100 shadow-uni-card overflow-hidden"
    >
      {/* ── Probability bar ─────────────────────────────────────────── */}
      <div className="h-1.5 flex">
        <div
          className="uni-bar-yes transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
        <div
          className="uni-bar-no transition-all duration-700"
          style={{ width: `${100 - pct}%` }}
        />
      </div>

      <div className="p-4">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-sm font-semibold text-gray-800 leading-snug flex-1">
            {market.question}
          </p>

          {/* Status pill */}
          {market.resolved ? (
            <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
              market.outcome
                ? "bg-blue-50 text-uniblue"
                : "bg-pink-50 text-unipink"
            }`}>
              {market.outcome ? "YES ✓" : "NO ✓"}
            </span>
          ) : isOver ? (
            <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              Closed
            </span>
          ) : (
            <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-violet-50 text-violet-500">
              {tLeft}
            </span>
          )}
        </div>

        {/* ── Probability display ─────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black text-uniblue">{pct}%</span>
            <span className="text-xs text-gray-400 font-medium">YES</span>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Pool</div>
            <div className="text-xs font-semibold text-gray-600">{formatUSDm(total)} USDm</div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 font-medium">NO</span>
            <span className="text-2xl font-black text-unipink">{100 - pct}%</span>
          </div>
        </div>

        {/* ── Mini pool pills ─────────────────────────────────────────── */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 flex items-center gap-1.5 bg-blue-50 rounded-xl px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-uniblue flex-shrink-0" />
            <span className="text-[11px] font-semibold text-uniblue">{formatUSDm(market.yesPool)}</span>
          </div>
          <div className="flex-1 flex items-center gap-1.5 bg-pink-50 rounded-xl px-3 py-1.5 justify-end">
            <span className="text-[11px] font-semibold text-unipink">{formatUSDm(market.noPool)}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-unipink flex-shrink-0" />
          </div>
        </div>

        {/* ── Bet buttons ─────────────────────────────────────────────── */}
        {!isOver && (
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => onBet(market, "yes")}
              className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white shadow-uni-blue"
              style={{ background: "linear-gradient(135deg, #007AFF, #60A5FA)" }}
            >
              Yes 🔵
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => onBet(market, "no")}
              className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white shadow-uni-pink"
              style={{ background: "linear-gradient(135deg, #FF007A, #FB7185)" }}
            >
              No 🌸
            </motion.button>
          </div>
        )}

        {/* ── Resolved state ──────────────────────────────────────────── */}
        {market.resolved && (
          <div className={`text-center py-2 rounded-2xl text-sm font-semibold ${
            market.outcome
              ? "bg-blue-50 text-uniblue"
              : "bg-pink-50 text-unipink"
          }`}>
            Result: {market.outcome ? "YES 🦄" : "NO 🌸"}
          </div>
        )}
      </div>
    </motion.article>
  );
}

/* ── Skeleton loader ─────────────────────────────────────────────────────────── */
export function MarketCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-uni-card overflow-hidden"
    >
      <div className="h-1.5 bg-gradient-to-r from-blue-100 to-pink-100 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-100 rounded-xl animate-pulse w-4/5" />
        <div className="h-3 bg-gray-100 rounded-xl animate-pulse w-3/5" />
        <div className="flex gap-2">
          <div className="flex-1 h-8 bg-blue-50 rounded-xl animate-pulse" />
          <div className="flex-1 h-8 bg-pink-50 rounded-xl animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-blue-100 rounded-2xl animate-pulse" />
          <div className="flex-1 h-10 bg-pink-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}
