"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "wagmi/connectors";
import { useEffect } from "react";
import { useConnect } from "wagmi";
import { celo, celoSepolia } from "@/lib/chains";

// Support both chains — user's wallet decides which is active
const wagmiConfig = createConfig({
  chains: [celo, celoSepolia],
  connectors: [injected()],
  transports: {
    [celo.id]:       http("https://forno.celo.org"),
    [celoSepolia.id]: http("https://forno.celo-sepolia.celo-testnet.org"),
  },
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10_000 } },
});

function MiniPayAutoConnect() {
  const { connect, connectors } = useConnect();
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window as { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay
    ) {
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
