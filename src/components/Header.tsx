"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { formatUSDm } from "@/lib/clients";
import { useUSDmBalance } from "@/hooks/usePredictionMarket";

function isMiniPay() {
  return typeof window !== "undefined" &&
    (window as { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay === true;
}

export function Header({ onCreateMarket }: { onCreateMarket: () => void }) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const balance = useUSDmBalance();

  return (
    <header className="sticky top-0 z-40 bg-[#0F0F1A]/90 backdrop-blur border-b border-white/10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-celo-green">◈</span>
          <span className="font-semibold text-white">Celo Prediction</span>
        </div>

        <div className="flex items-center gap-2">
          {isConnected && address ? (
            <>
              <span className="hidden sm:block text-xs text-gray-400">
                {formatUSDm(balance)} USDm
              </span>
              <button
                onClick={onCreateMarket}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-celo-green text-black hover:bg-celo-green/90 transition-colors"
              >
                + Market
              </button>
              {!isMiniPay() && (
                <button
                  onClick={() => disconnect()}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  {address.slice(0, 6)}…{address.slice(-4)}
                </button>
              )}
            </>
          ) : (
            !isMiniPay() && (
              <button
                onClick={() => connect({ connector: injected() })}
                className="px-4 py-1.5 text-sm font-medium rounded-lg bg-celo-green text-black hover:bg-celo-green/90 transition-colors"
              >
                Connect
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
