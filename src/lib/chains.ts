import { defineChain } from "viem";
import { celo } from "viem/chains";

// Celo Sepolia — viem/wagmi may not export this yet
export const celoSepolia = defineChain({
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://forno.celo-sepolia.celo-testnet.org"] },
    public:  { http: ["https://forno.celo-sepolia.celo-testnet.org"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://celo-sepolia.blockscout.com" },
  },
  testnet: true,
});

export { celo };

const envChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 11142220);
export const ACTIVE_CHAIN = envChainId === 42220 ? celo : celoSepolia;
