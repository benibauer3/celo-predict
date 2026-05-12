"use client";

import { motion } from "framer-motion";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { UnicornLogo, UniforesWordmark } from "./UnicornLogo";
import { useUSDmBalance } from "@/hooks/usePredictionMarket";
import { formatUSDm } from "@/lib/clients";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  onCreateMarket: () => void;
}

function isMiniPay() {
  return typeof window !== "undefined" &&
    (window as { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay === true;
}

export function UnicornHeader({ search, setSearch, onCreateMarket }: Props) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const balance = useUSDmBalance();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      {/* ── Top bar ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
        {/* Logo + wordmark */}
        <div className="flex items-center gap-2.5">
          <UnicornLogo size={36} animated />
          <UniforesWordmark size="md" />
        </div>

        {/* Wallet */}
        <div className="flex items-center gap-2">
          {isConnected && address ? (
            <>
              {/* Balance badge */}
              <div className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-pink-50 border border-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-uniblue to-unipink" />
                {formatUSDm(balance)} USDm
              </div>

              {/* Create market */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onCreateMarket}
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-uniblue to-unipink text-white text-lg font-bold flex items-center justify-center shadow-md shadow-violet-200"
              >
                +
              </motion.button>

              {/* Address chip */}
              {!isMiniPay() && (
                <button
                  onClick={() => disconnect()}
                  className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 text-xs font-mono text-gray-600 hover:bg-gray-100 transition-colors active:scale-95"
                >
                  {address.slice(0, 6)}…{address.slice(-4)}
                </button>
              )}
            </>
          ) : (
            !isMiniPay() && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => connect({ connector: injected() })}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white shadow-uni-blue"
                style={{ background: "linear-gradient(135deg, #007AFF, #8B5CF6)" }}
              >
                Conectar
              </motion.button>
            )
          )}
        </div>
      </div>

      {/* ── Search bar ─────────────────────────────────────────────── */}
      <div className="px-4 pb-3 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Gradient border trick */}
          <div className="absolute -inset-[1.5px] rounded-2xl bg-gradient-to-r from-uniblue via-violet-400 to-unipink opacity-40 blur-[1px] rounded-2xl" />

          <div className="relative flex items-center bg-white rounded-2xl overflow-hidden">
            <span className="pl-4 text-gray-400 text-base flex-shrink-0">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="O que o Unicórnio deve buscar hoje?"
              className="w-full px-3 py-3 text-sm text-gray-700 placeholder:text-gray-400 bg-transparent outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="pr-4 text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0"
              >
                ×
              </button>
            )}
            {!search && (
              <span className="pr-4 text-lg flex-shrink-0">🦄</span>
            )}
          </div>
        </motion.div>
      </div>
    </header>
  );
}
