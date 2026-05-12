"use client";

import { motion } from "framer-motion";
import { SuerteLogo, SuerteLogoHorizontal } from "@/components/suerte/SuerteLogo";
import { SparklesCursor } from "@/components/uniforest/SparklesCursor";

export default function SuertePage() {
  return (
    <>
      <SparklesCursor />

      <div className="min-h-screen bg-white flex flex-col">

        {/* ── Demo Header ──────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 h-14 flex items-center justify-between">
          <SuerteLogoHorizontal size={38} />
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.94 }}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #007AFF, #FF007A)" }}
            >
              Connect Wallet
            </motion.button>
          </div>
        </header>

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center relative overflow-hidden">

          {/* Background blobs */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-blue-50 rounded-full blur-[100px] opacity-60 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-50 rounded-full blur-[80px] opacity-60 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[120px] opacity-25 pointer-events-none"
               style={{ background: "radial-gradient(circle, #007AFF 0%, #FF007A 100%)" }} />

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center gap-8 max-w-lg"
          >
            {/* Main logo – large, centred */}
            <SuerteLogo size={160} animated showText textSize="xl" />

            {/* Tagline */}
            <div className="space-y-3">
              <p className="text-gray-500 text-base leading-relaxed max-w-sm mx-auto">
                The oracle of luck for Latin America. Predict any event, earn{" "}
                <strong className="text-gray-800">USDm & USDT</strong> — fully on-chain, on Celo.
              </p>

              {/* Token badges */}
              <div className="flex items-center justify-center gap-3 pt-1">
                {[
                  { emoji: "💵", label: "USDm", sub: "Mento" },
                  { emoji: "💲", label: "USDT", sub: "Tether" },
                ].map(t => (
                  <div key={t.label}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-2xl shadow-sm text-sm"
                  >
                    <span>{t.emoji}</span>
                    <span className="font-bold text-gray-800">{t.label}</span>
                    <span className="text-gray-400 text-xs">{t.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex-1 sm:flex-none px-8 py-4 rounded-2xl font-black text-base text-white shadow-lg"
                style={{ background: "linear-gradient(135deg, #007AFF, #8B5CF6, #FF007A)" }}
              >
                Start Predicting →
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex-1 sm:flex-none px-8 py-4 rounded-2xl font-bold text-base text-gray-700 border-2 border-gray-200 hover:border-blue-200 transition-colors"
              >
                Browse Markets 🔮
              </motion.button>
            </div>

            <p className="text-xs text-gray-400">
              Non-custodial · 2% protocol fee · Rewards in USDm & USDT
            </p>
          </motion.div>
        </main>

        {/* ── Size showcase (dev reference) ────────────────────────── */}
        <section className="border-t border-gray-100 bg-gray-50 py-12 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Logo scale reference
            </p>
            <div className="flex flex-wrap items-end justify-center gap-8">
              {[
                { size: 56,  label: "56px · nav"     },
                { size: 80,  label: "80px · card"    },
                { size: 120, label: "120px · hero"   },
                { size: 160, label: "160px · splash" },
              ].map(({ size, label }) => (
                <div key={size} className="flex flex-col items-center gap-3">
                  <SuerteLogo size={size} animated={false} showText={false} />
                  <p className="text-[10px] text-gray-400">{label}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                Horizontal (header) variant
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8">
                {[32, 40, 52].map(s => (
                  <SuerteLogoHorizontal key={s} size={s} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-gray-100 py-6 px-4 text-center text-xs text-gray-400">
          Suerte Market · Built on Celo L2 · Chain ID 42220
        </footer>
      </div>
    </>
  );
}
