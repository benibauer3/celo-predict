"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import type { Market } from "@/hooks/usePredictionMarket";
import { useMarketActions, usePreviewWin, useUSDmBalance, useProbabilityHistory } from "@/hooks/usePredictionMarket";
import { formatUSDm, timeLeft } from "@/lib/clients";
import { ProbabilityChart } from "./ProbabilityChart";

const QUICK_AMOUNTS = ["1", "5", "10", "50", "100"];

interface Props {
  market: Market;
  initialSide: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = "bet" | "confirm" | "success";

export function BetModal({ market, initialSide, onClose, onSuccess }: Props) {
  const { isConnected } = useAccount();
  const [side, setSide] = useState(initialSide);
  const [amount, setAmount] = useState("5");
  const [step, setStep] = useState<Step>("bet");

  const balance = useUSDmBalance();
  const { payout } = usePreviewWin(market.id, side, amount);
  const { history } = useProbabilityHistory(market.id);
  const { placeBet, pending, txHash, error, reset } = useMarketActions();

  const numAmount = parseFloat(amount) || 0;
  const net = payout > 0n ? payout - BigInt(Math.round(numAmount * 1e18)) : 0n;
  const multiplier = numAmount > 0 && payout > 0n
    ? (Number(payout) / 1e18 / numAmount).toFixed(2)
    : "—";
  const insufficientBalance = balance < BigInt(Math.round(numAmount * 1e18));
  const canBet = isConnected && numAmount >= 0.1 && !insufficientBalance;

  const total = market.yesPool + market.noPool;
  const yesPct = total > 0n ? Math.round(Number(market.yesPool * 100n / total)) : 50;

  async function handleConfirm() {
    const ok = await placeBet(market.id, side, amount);
    if (ok) { setStep("success"); }
  }

  function handleClose() {
    if (step === "success") onSuccess();
    else { reset(); onClose(); }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="w-full max-w-md bg-[#10101C] border border-white/8 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* ── Step: BET ─────────────────────────────────────────────────── */}
        {step === "bet" && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-white/5">
              <div className="flex-1 min-w-0">
                <p className="text-[#8B8FA8] text-xs mb-1">{timeLeft(market.endTime)}</p>
                <p className="text-white font-semibold text-sm leading-snug line-clamp-2 pr-4">
                  {market.question}
                </p>
              </div>
              <button onClick={handleClose} className="text-[#5A5A78] hover:text-white text-xl leading-none flex-shrink-0 mt-1">✕</button>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* Side toggle */}
              <div className="flex rounded-2xl overflow-hidden border border-white/8 p-1 gap-1 bg-white/[0.03]">
                <button
                  onClick={() => setSide(true)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                    side
                      ? "bg-[#35D07F] text-black shadow-lg shadow-[#35D07F]/20"
                      : "text-[#35D07F] hover:bg-[#35D07F]/10"
                  }`}
                >
                  YES — {yesPct}%
                </button>
                <button
                  onClick={() => setSide(false)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                    !side
                      ? "bg-[#E84040] text-white shadow-lg shadow-[#E84040]/20"
                      : "text-[#E84040] hover:bg-[#E84040]/10"
                  }`}
                >
                  NO — {100 - yesPct}%
                </button>
              </div>

              {/* Chart */}
              {history.length > 1 && (
                <div>
                  <p className="text-[#5A5A78] text-xs mb-2">Probability history</p>
                  <ProbabilityChart history={history} height={100} />
                </div>
              )}

              {/* Amount */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B8FA8]">Amount</span>
                  <span className="text-[#8B8FA8]">
                    Balance:{" "}
                    <span className={insufficientBalance ? "text-[#E84040]" : "text-white"}>
                      {formatUSDm(balance)} USDm
                    </span>
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-2xl font-bold font-mono outline-none focus:border-[#35D07F]/40 transition-colors pr-20"
                    placeholder="0.00"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#8B8FA8] text-sm font-medium">USDm</span>
                </div>

                {/* Quick amounts */}
                <div className="flex gap-1.5">
                  {QUICK_AMOUNTS.map((v) => (
                    <button
                      key={v}
                      onClick={() => setAmount(v)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                        amount === v
                          ? "bg-[#35D07F]/20 text-[#35D07F] border border-[#35D07F]/30"
                          : "bg-white/5 text-[#8B8FA8] hover:bg-white/10"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {payout > 0n && (
                <div className="bg-white/[0.03] border border-white/8 rounded-2xl px-4 py-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8B8FA8]">If you win</span>
                    <span className="text-white font-bold">{formatUSDm(payout)} USDm</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8B8FA8]">Profit</span>
                    <span className={`font-bold ${net > 0n ? "text-[#35D07F]" : "text-[#FBCC5C]"}`}>
                      +{formatUSDm(net)} USDm
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8B8FA8]">Multiplier</span>
                    <span className="text-[#FBCC5C] font-bold">{multiplier}×</span>
                  </div>
                  <div className="border-t border-white/5 pt-2 flex justify-between text-xs text-[#5A5A78]">
                    <span>Network fee</span>
                    <span>Paid in USDm · CIP-64</span>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-[#E84040]/10 border border-[#E84040]/20 rounded-xl px-4 py-3 text-sm text-[#E84040]">
                  {error}
                </div>
              )}

              {/* CTA */}
              <button
                onClick={() => canBet && setStep("confirm")}
                disabled={!canBet}
                className={`w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95 ${
                  side
                    ? "bg-[#35D07F] text-black shadow-lg shadow-[#35D07F]/20 hover:bg-[#35D07F]/90"
                    : "bg-[#E84040] text-white shadow-lg shadow-[#E84040]/20 hover:bg-[#E84040]/90"
                } disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none`}
              >
                {insufficientBalance
                  ? "Insufficient USDm"
                  : !isConnected
                  ? "Connect wallet"
                  : numAmount < 0.1
                  ? "Min 0.1 USDm"
                  : `Bet ${side ? "YES" : "NO"} — ${numAmount.toFixed(1)} USDm`}
              </button>
            </div>
          </>
        )}

        {/* ── Step: CONFIRM ─────────────────────────────────────────────── */}
        {step === "confirm" && (
          <div className="px-5 pt-5 pb-8 space-y-5">
            <div className="text-center space-y-1">
              <div className={`text-5xl font-black mb-2 ${side ? "text-[#35D07F]" : "text-[#E84040]"}`}>
                {side ? "YES" : "NO"}
              </div>
              <p className="text-white font-semibold text-sm line-clamp-2">{market.question}</p>
            </div>

            <div className="bg-white/[0.03] border border-white/8 rounded-2xl divide-y divide-white/5">
              {[
                ["Your bet", `${numAmount.toFixed(2)} USDm`],
                ["Side", side ? "YES" : "NO"],
                ["Potential return", payout > 0n ? `${formatUSDm(payout)} USDm` : "—"],
                ["Multiplier", `${multiplier}×`],
                ["Fee", "2% protocol + USDm network"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-[#8B8FA8]">{label}</span>
                  <span className="text-white font-medium">{value}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="bg-[#E84040]/10 border border-[#E84040]/20 rounded-xl px-4 py-3 text-sm text-[#E84040]">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { reset(); setStep("bet"); }}
                disabled={pending}
                className="flex-1 py-4 rounded-2xl font-semibold text-sm border border-white/10 text-white hover:bg-white/5 transition-all active:scale-95 disabled:opacity-40"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={pending}
                className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-40 ${
                  side ? "bg-[#35D07F] text-black" : "bg-[#E84040] text-white"
                }`}
              >
                {pending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Signing…
                  </span>
                ) : (
                  "Confirm & Sign"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Step: SUCCESS ─────────────────────────────────────────────── */}
        {step === "success" && (
          <div className="px-5 py-10 text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <p className="text-white font-bold text-lg">Bet placed!</p>
            <p className="text-[#8B8FA8] text-sm">
              You bet <span className={side ? "text-[#35D07F]" : "text-[#E84040]"}>
                {side ? "YES" : "NO"}
              </span> with {numAmount.toFixed(2)} USDm.
              <br />Good luck!
            </p>
            {txHash && (
              <a
                href={`https://celo-sepolia.blockscout.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs text-[#35D07F] hover:underline"
              >
                View on Blockscout ↗
              </a>
            )}
            <button
              onClick={handleClose}
              className="w-full mt-2 py-4 rounded-2xl font-bold bg-[#35D07F] text-black hover:bg-[#35D07F]/90 transition-all active:scale-95"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
