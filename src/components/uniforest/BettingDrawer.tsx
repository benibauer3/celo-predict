"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Market } from "@/hooks/usePredictionMarket";
import { useMarketActions, useUSDmBalance } from "@/hooks/usePredictionMarket";
import { formatUSDm } from "@/lib/clients";

interface Props {
  market: Market | null;
  initialSide: "yes" | "no";
  onClose: () => void;
}

const PRESETS = ["1", "5", "10", "25"];

type Step = "bet" | "confirm" | "success";

export function BettingDrawer({ market, initialSide, onClose }: Props) {
  const [side, setSide]       = useState<"yes" | "no">(initialSide);
  const [amount, setAmount]   = useState("5");
  const [step, setStep]       = useState<Step>("bet");
  const [txHash, setTxHash]   = useState<string | null>(null);
  const [error, setError]     = useState<string>("");
  const balance               = useUSDmBalance();
  const { placeBet, pending: loading, txHash: hookTxHash } = useMarketActions();

  // sync side when drawer opens for a new market
  useEffect(() => { setSide(initialSide); }, [initialSide]);
  useEffect(() => { setStep("bet"); setError(""); setTxHash(null); }, [market]);

  const amountNum = parseFloat(amount) || 0;
  const isBlue    = side === "yes";

  function yesPercent(m: Market): number {
    const total = m.yesPool + m.noPool;
    if (total === 0n) return 50;
    return Math.round(Number((m.yesPool * 100n) / total));
  }

  async function handleConfirm() {
    if (!market) return;
    setError("");
    try {
      const ok = await placeBet(market.id, side === "yes", String(amountNum));
      if (ok) {
        setTxHash(hookTxHash ?? null);
        setStep("success");
      } else {
        setError("Transaction failed. Please try again.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg.slice(0, 120));
    }
  }

  const backdropVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1 },
  };
  const drawerVariants = {
    hidden:  { y: "100%" },
    visible: { y: "0%", transition: { type: "spring" as const, damping: 28, stiffness: 300 } },
    exit:    { y: "100%", transition: { duration: 0.25, ease: "easeIn" as const } },
  };

  return (
    <AnimatePresence>
      {market && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            key="drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-lg mx-auto"
          >
            {/* Handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="px-5 pb-8">
              {/* ── Header ──────────────────────────────────────────── */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black text-gray-800">
                  {step === "success" ? "🦄 Bet Confirmed!" : "Place a Bet"}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Question */}
              <p className="text-sm text-gray-500 mb-4 leading-snug line-clamp-2">
                {market.question}
              </p>

              {/* ── STEP: bet ──────────────────────────────────────── */}
              {step === "bet" && (
                <div className="space-y-4">
                  {/* Side toggle */}
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
                    <button
                      onClick={() => setSide("yes")}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        isBlue
                          ? "text-white shadow-uni-blue"
                          : "text-gray-500 bg-transparent"
                      }`}
                      style={isBlue ? { background: "linear-gradient(135deg, #007AFF, #60A5FA)" } : {}}
                    >
                      YES 🔵  {yesPercent(market)}%
                    </button>
                    <button
                      onClick={() => setSide("no")}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        !isBlue
                          ? "text-white shadow-uni-pink"
                          : "text-gray-500 bg-transparent"
                      }`}
                      style={!isBlue ? { background: "linear-gradient(135deg, #FF007A, #FB7185)" } : {}}
                    >
                      NO 🌸  {100 - yesPercent(market)}%
                    </button>
                  </div>

                  {/* Amount presets */}
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2">Amount (USDm)</div>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {PRESETS.map(p => (
                        <button
                          key={p}
                          onClick={() => setAmount(p)}
                          className={`py-2 rounded-xl text-sm font-bold transition-all ${
                            amount === p
                              ? isBlue
                                ? "bg-uniblue text-white"
                                : "bg-unipink text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          ${p}
                        </button>
                      ))}
                    </div>
                    <div className={`flex items-center gap-2 border-2 rounded-2xl px-4 py-3 ${
                      isBlue ? "border-uniblue/30 focus-within:border-uniblue" : "border-unipink/30 focus-within:border-unipink"
                    } transition-colors`}>
                      <span className="text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="flex-1 text-base font-bold text-gray-800 outline-none bg-transparent"
                        placeholder="0.00"
                        min="0.1"
                        step="0.1"
                      />
                      <span className="text-xs text-gray-400">USDm</span>
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Available balance</span>
                    <span className="font-semibold text-gray-600">{formatUSDm(balance)} USDm</span>
                  </div>

                  {/* Potential win */}
                  {amountNum > 0 && (
                    <div className={`flex items-center justify-between px-4 py-3 rounded-2xl ${
                      isBlue ? "bg-blue-50" : "bg-pink-50"
                    }`}>
                      <span className="text-xs font-medium text-gray-500">Potential payout</span>
                      <span className={`text-sm font-black ${isBlue ? "text-uniblue" : "text-unipink"}`}>
                        {calcPotentialWin(market, side, amountNum)}× 🦄
                      </span>
                    </div>
                  )}

                  {error && (
                    <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { if (amountNum > 0) setStep("confirm"); }}
                    disabled={amountNum <= 0}
                    className="w-full py-4 rounded-2xl text-base font-black text-white disabled:opacity-40"
                    style={{ background: isBlue
                      ? "linear-gradient(135deg, #007AFF, #60A5FA)"
                      : "linear-gradient(135deg, #FF007A, #FB7185)"
                    }}
                  >
                    Continue →
                  </motion.button>
                </div>
              )}

              {/* ── STEP: confirm ───────────────────────────────────── */}
              {step === "confirm" && (
                <div className="space-y-4">
                  <div className={`rounded-2xl p-4 ${isBlue ? "bg-blue-50" : "bg-pink-50"}`}>
                    <div className="space-y-3">
                      {[
                        { label: "Direction", value: side === "yes" ? "YES 🔵" : "NO 🌸" },
                        { label: "Amount",    value: `${amountNum} USDm` },
                        { label: "Fee",       value: "2%" },
                        { label: "Net",       value: `${(amountNum * 0.98).toFixed(2)} USDm` },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between text-sm">
                          <span className="text-gray-500">{label}</span>
                          <span className={`font-bold ${isBlue ? "text-uniblue" : "text-unipink"}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep("bet")}
                      className="flex-1 py-3 rounded-2xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      Back
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleConfirm}
                      disabled={loading}
                      className="flex-1 py-3 rounded-2xl text-sm font-black text-white disabled:opacity-60 relative overflow-hidden"
                      style={{ background: isBlue
                        ? "linear-gradient(135deg, #007AFF, #60A5FA)"
                        : "linear-gradient(135deg, #FF007A, #FB7185)"
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin text-base">✦</span>
                          Sending...
                        </span>
                      ) : "Confirm Bet 🦄"}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* ── STEP: success ───────────────────────────────────── */}
              {step === "success" && (
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="text-6xl">🦄✨</div>
                  <div>
                    <p className="font-black text-gray-800 text-lg">Bet placed!</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {amountNum} USDm on <span className={isBlue ? "text-uniblue" : "text-unipink"}>
                        {side === "yes" ? "YES" : "NO"}
                      </span>
                    </p>
                  </div>
                  {txHash && (
                    <a
                      href={`https://celoscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-violet-500 underline underline-offset-2"
                    >
                      View transaction ↗
                    </a>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="w-full py-4 rounded-2xl text-base font-black text-white"
                    style={{ background: "linear-gradient(135deg, #007AFF, #8B5CF6, #FF007A)" }}
                  >
                    Close ✦
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function calcPotentialWin(market: Market, side: "yes" | "no", amount: number): string {
  const yesPool = Number(market.yesPool) / 1e18;
  const noPool  = Number(market.noPool)  / 1e18;
  const netAmt  = amount * 0.98;

  let ratio: number;
  if (side === "yes") {
    const newYes = yesPool + netAmt;
    ratio = newYes > 0 ? (newYes + noPool) / newYes : 1;
  } else {
    const newNo = noPool + netAmt;
    ratio = newNo > 0 ? (yesPool + newNo) / newNo : 1;
  }
  return ratio.toFixed(2);
}
