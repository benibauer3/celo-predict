import { ACTIVE_CHAIN } from "./chains";

export { ACTIVE_CHAIN };

// ─── Addresses ────────────────────────────────────────────────────────────────
export const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 11142220);

// USDm — token address == feeCurrency address (18 decimals, no adapter needed)
export const USDM_ADDRESS = (
  chainId === 42220
    ? "0x765DE816845861e75A25fCA122bb6898B8B1282a"
    : "0xEF4d55D6dE8e8d73232827Cd1e9b2F2dBb45bC80"
) as `0x${string}`;

export const USDM_FEE_CURRENCY = USDM_ADDRESS;

// ─── ABIs ─────────────────────────────────────────────────────────────────────
export const ERC20_ABI = [
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const PREDICTION_MARKET_ABI = [
  // ── Views ──
  {
    name: "marketCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getMarket",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "question", type: "string" },
          { name: "imageUrl", type: "string" },
          { name: "endTime", type: "uint256" },
          { name: "resolver", type: "address" },
          { name: "resolved", type: "bool" },
          { name: "outcome", type: "bool" },
          { name: "yesPool", type: "uint256" },
          { name: "noPool", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "getMarkets",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "from", type: "uint256" },
      { name: "count", type: "uint256" },
    ],
    outputs: [
      {
        name: "result",
        type: "tuple[]",
        components: [
          { name: "question", type: "string" },
          { name: "imageUrl", type: "string" },
          { name: "endTime", type: "uint256" },
          { name: "resolver", type: "address" },
          { name: "resolved", type: "bool" },
          { name: "outcome", type: "bool" },
          { name: "yesPool", type: "uint256" },
          { name: "noPool", type: "uint256" },
        ],
      },
      { name: "total", type: "uint256" },
    ],
  },
  {
    name: "getPosition",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "yesAmount", type: "uint256" },
          { name: "noAmount", type: "uint256" },
          { name: "claimed", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "previewPayout",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "previewPotentialWin",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "side", type: "bool" },
      { name: "betAmount", type: "uint256" },
    ],
    outputs: [
      { name: "potentialPayout", type: "uint256" },
      { name: "impliedOdds", type: "uint256" },
    ],
  },
  {
    name: "accumulatedFees",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // ── Writes ──
  {
    name: "createMarket",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "question", type: "string" },
      { name: "imageUrl", type: "string" },
      { name: "endTime", type: "uint256" },
      { name: "resolver", type: "address" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
  {
    name: "placeBet",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "side", type: "bool" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "resolveMarket",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "outcome", type: "bool" },
    ],
    outputs: [],
  },
  {
    name: "claimWinnings",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
  {
    name: "withdrawFees",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  // ── Events ──
  {
    name: "MarketCreated",
    type: "event",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "question", type: "string", indexed: false },
      { name: "endTime", type: "uint256", indexed: false },
      { name: "resolver", type: "address", indexed: true },
      { name: "creator", type: "address", indexed: true },
    ],
  },
  {
    name: "BetPlaced",
    type: "event",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "side", type: "bool", indexed: false },
      { name: "netAmount", type: "uint256", indexed: false },
    ],
  },
  {
    name: "MarketResolved",
    type: "event",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "outcome", type: "bool", indexed: false },
    ],
  },
  {
    name: "WinningsClaimed",
    type: "event",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;
