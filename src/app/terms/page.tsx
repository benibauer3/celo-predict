"use client";

import Link from "next/link";
import { SuerteLogoHorizontal } from "@/components/suerte/SuerteLogo";

export default function TermsPage() {
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
          <h1 className="text-2xl font-black text-gray-900 mb-1">Terms of Service</h1>
          <p className="text-xs text-gray-400">Last updated: May 14, 2026 · Suerte Market</p>
        </div>

        <Section title="1. Acceptance of Terms">
          By accessing or using Suerte Market (the &quot;App&quot;), you agree to be bound by these Terms of
          Service. If you do not agree, do not use the App. Suerte Market is a non-custodial
          prediction market protocol built on the Celo blockchain network (Chain ID 42220).
        </Section>

        <Section title="2. Eligibility">
          You must be at least 18 years of age and not a resident of a jurisdiction where prediction
          markets or stablecoin-based wagering are prohibited. By using the App you represent that
          you meet these requirements.
        </Section>

        <Section title="3. Non-Custodial Protocol">
          Suerte Market is a fully non-custodial application. All transactions are executed
          directly on the Celo blockchain through your own wallet. We do not hold, control, or have
          access to your funds at any time. You are solely responsible for the security of your
          private keys and wallet.
        </Section>

        <Section title="4. Protocol Fee">
          A 2% protocol fee is deducted from each bet at the time of placement. Fees are collected
          automatically by the smart contract and used to sustain protocol operations. There are no
          hidden fees.
        </Section>

        <Section title="5. Stablecoins & Rewards">
          The App accepts bets denominated in USDm (Mento Dollar) and may distribute winnings in
          USDm and USDT. Transaction network fees are paid automatically via Celo's fee abstraction
          (CIP-64) — you do not need to hold CELO to use the App.
        </Section>

        <Section title="6. Smart Contract Risk">
          Suerte Market smart contracts are deployed on the Celo network and are immutable once
          deployed. While the code is open-source and verified on Celoscan, no smart contract is
          entirely free of risk. You acknowledge and accept the inherent risks of interacting with
          blockchain protocols.
        </Section>

        <Section title="7. Market Resolution">
          Markets are resolved by designated resolvers based on publicly verifiable outcomes. In the
          event of a dispute or unresolvable outcome, the protocol may refund all participants at its
          discretion.
        </Section>

        <Section title="8. Prohibited Use">
          You agree not to use the App to engage in money laundering, market manipulation, or any
          activity prohibited by applicable law. We reserve the right to block access from
          jurisdictions where such services are prohibited.
        </Section>

        <Section title="9. No Financial Advice">
          Nothing in the App constitutes financial, investment, or legal advice. Prediction markets
          involve risk of loss. Only use funds you can afford to lose.
        </Section>

        <Section title="10. Limitation of Liability">
          To the maximum extent permitted by law, Suerte Market and its operators shall not be
          liable for any loss of funds, data, or profits arising from use of the App, including
          losses due to smart contract bugs, network failures, or oracle errors.
        </Section>

        <Section title="11. Changes to Terms">
          We may update these Terms at any time. Continued use of the App after changes constitutes
          acceptance of the new Terms. The &quot;last updated&quot; date at the top will always reflect the
          current version.
        </Section>

        <Section title="12. Contact">
          For questions about these Terms, contact us via{" "}
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
          <Link href="/terms" className="hover:text-gray-600 font-semibold text-gray-600">Terms</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
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
      <p className="text-sm leading-relaxed text-gray-600">{children}</p>
    </section>
  );
}
