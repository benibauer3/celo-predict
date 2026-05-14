"use client";

import Link from "next/link";
import { SuerteLogoHorizontal } from "@/components/suerte/SuerteLogo";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 h-14 flex items-center justify-between max-w-2xl mx-auto w-full">
        <Link href="/">
          <SuerteLogoHorizontal size={32} />
        </Link>
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          ← Back
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-8 text-gray-700">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">Privacy Policy</h1>
          <p className="text-xs text-gray-400">Last updated: May 14, 2026 · Suerte Market</p>
        </div>

        <Section title="1. Overview">
          Suerte Market is a non-custodial, on-chain prediction market. We are committed to
          protecting your privacy. This policy explains what data we collect, how we use it, and
          your rights regarding that data.
        </Section>

        <Section title="2. Data We Collect">
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>
              <strong>Wallet address</strong> — your public blockchain address, used to identify
              your bets and positions. This is inherently public information on the Celo blockchain.
            </li>
            <li>
              <strong>Transaction data</strong> — bets placed, markets participated in, winnings
              claimed. All stored on-chain and publicly visible.
            </li>
            <li>
              <strong>Usage analytics</strong> — anonymous page views and interaction events (no
              personally identifiable information).
            </li>
          </ul>
        </Section>

        <Section title="3. Data We Do NOT Collect">
          We do not collect your name, email address, phone number, IP address, or any off-chain
          personally identifiable information. We do not use cookies for tracking. We do not sell
          your data to third parties.
        </Section>

        <Section title="4. On-Chain Data Visibility">
          All bets, positions, and payouts are recorded on the Celo public blockchain. This
          information is permanently public and visible to anyone. Do not use prediction markets
          if you require full financial privacy.
        </Section>

        <Section title="5. MiniPay Integration">
          When you use Suerte Market inside the MiniPay wallet app, your wallet address is
          provided to us automatically by the MiniPay environment. We do not request, store, or
          transmit your phone number. Phone number resolution (if any) is handled locally by your
          wallet and is not shared with our servers.
        </Section>

        <Section title="6. Third-Party Services">
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>
              <strong>Celo RPC (forno.celo.org)</strong> — used to read and write blockchain data.
            </li>
            <li>
              <strong>Celoscan (celoscan.io)</strong> — linked for transaction verification.
            </li>
            <li>
              <strong>Vercel</strong> — hosts the web application. Vercel&apos;s own privacy policy applies
              to server-level request logs.
            </li>
          </ul>
        </Section>

        <Section title="7. Data Retention">
          We do not maintain a centralised database of user data. On-chain data persists for as
          long as the Celo blockchain exists. Anonymous analytics are retained for up to 90 days.
        </Section>

        <Section title="8. Your Rights">
          Because Suerte Market is non-custodial and holds no personal data, there is no account
          to delete. You may stop using the App at any time. On-chain transaction history cannot be
          deleted — this is a fundamental property of public blockchains.
        </Section>

        <Section title="9. Security">
          We do not store private keys, seed phrases, or wallet credentials. All cryptographic
          signing occurs in your local wallet. We recommend using a reputable wallet application
          and keeping your recovery phrase secure.
        </Section>

        <Section title="10. Changes to This Policy">
          We may update this Privacy Policy periodically. The &quot;last updated&quot; date will always
          reflect the current version. Continued use after changes constitutes acceptance.
        </Section>

        <Section title="11. Contact">
          Privacy questions? Reach us at{" "}
          <a
            href="https://t.me/suertemarket"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            Telegram (@suertemarket)
          </a>.
        </Section>
      </main>

      <footer className="border-t border-gray-100 py-6 px-4 text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <Link href="/terms" className="hover:text-gray-600">Terms</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-gray-600 font-semibold text-gray-600">Privacy</Link>
          <span>·</span>
          <span>Suerte Market · Celo L2 · Chain ID 42220</span>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      <div className="text-sm leading-relaxed text-gray-600">{children}</div>
    </section>
  );
}
