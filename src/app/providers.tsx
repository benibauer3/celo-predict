"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { celo, celoAlfajores } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "wagmi/connectors";
import { useEffect } from "react";
import { useConnect } from "wagmi";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 11142220);
const activeChain = chainId === 42220 ? celo : celoAlfajores;
const rpcUrl = chainId === 42220
  ? "https://forno.celo.org"
  : "https://forno.celo-sepolia.celo-testnet.org";

const wagmiConfig = createConfig({
  chains: [activeChain],
  connectors: [injected()],
  transports: { [activeChain.id]: http(rpcUrl) },
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10_000 } },
});

function MiniPayAutoConnect() {
  const { connect, connectors } = useConnect();
  useEffect(() => {
    if (typeof window !== "undefined" && (window as { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay) {
      connect({ connector: connectors[0] });
    }
  }, [connect, connectors]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <MiniPayAutoConnect />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
