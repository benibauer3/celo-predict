"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useMarketActions } from "@/hooks/usePredictionMarket";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateMarketModal({ onClose, onSuccess }: Props) {
  const { address, isConnected } = useAccount();
  const [question, setQuestion] = useState("");
  const [endDate, setEndDate] = useState("");
  const [resolver, setResolver] = useState(address ?? "");
  const { createMarket, pending, txHash, error } = useMarketActions();

  async function handleCreate() {
    if (!question.trim() || !endDate || !resolver) return;
    await createMarket(
      question.trim(),
      "",
      new Date(endDate),
      resolver as `0x${string}`
    );
    onSuccess();
  }

  const minDate = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-[#16162A] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Create Market</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {/* Question */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Question</label>
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Will BTC reach $150k by end of 2025?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-celo-green/50 transition-colors resize-none"
            />
          </div>

          {/* End date */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Betting closes at</label>
            <input
              type="datetime-local"
              min={minDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-celo-green/50 transition-colors"
            />
          </div>

          {/* Resolver */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">
              Resolver address{" "}
              <span className="text-gray-600">(who can resolve this market)</span>
            </label>
            <input
              type="text"
              value={resolver}
              onChange={(e) => setResolver(e.target.value)}
              placeholder="0x..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono outline-none focus:border-celo-green/50 transition-colors"
            />
            {address && resolver !== address && (
              <button
                onClick={() => setResolver(address)}
                className="text-xs text-celo-green hover:underline"
              >
                Use my address
              </button>
            )}
          </div>
        </div>

        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        {txHash && (
          <p className="text-celo-green text-xs text-center">
            ✓ Market created!
          </p>
        )}

        <button
          onClick={handleCreate}
          disabled={pending || !isConnected || !question.trim() || !endDate || !resolver}
          className="w-full py-3 rounded-xl font-semibold text-sm bg-celo-green text-black hover:bg-celo-green/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pending ? "Creating…" : "Create Market"}
        </button>

        <p className="text-center text-xs text-gray-600">
          Free to create · Resolution is manual by the resolver address
        </p>
      </div>
    </div>
  );
}
