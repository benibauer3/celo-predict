import { ethers, network } from "hardhat";

const TOKENS = {
  celo: {
    usdm: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  },
  celoSepolia: {
    usdm: "0xEF4d55D6dE8e8d73232827Cd1e9b2F2dBb45bC80",
  },
} as const;

async function main() {
  const [deployer] = await ethers.getSigners();
  const net = network.name as keyof typeof TOKENS;

  console.log("Deploying PredictionMarket...");
  console.log("Network  :", net);
  console.log("Deployer :", deployer.address);
  console.log("Balance  :", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "CELO");

  const usdm = TOKENS[net]?.usdm;
  if (!usdm) throw new Error(`No token config for network: ${net}`);

  const Factory = await ethers.getContractFactory("PredictionMarket");
  const contract = await Factory.deploy(usdm);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n✓ PredictionMarket deployed to:", address);
  console.log("\nAdd to .env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log(`NEXT_PUBLIC_CHAIN_ID=${network.config.chainId}`);

  // Seed two example markets (only on testnet)
  if (net === "celoSepolia") {
    const now = Math.floor(Date.now() / 1000);
    const oneWeek = now + 7 * 24 * 3600;
    const twoWeeks = now + 14 * 24 * 3600;

    await contract.createMarket(
      "Will CELO reach $1 before July 2025?",
      "",
      BigInt(oneWeek),
      deployer.address
    );
    await contract.createMarket(
      "Will Ethereum ETF daily volume exceed $1B in 2025?",
      "",
      BigInt(twoWeeks),
      deployer.address
    );
    console.log("\n✓ Seeded 2 example markets");
  }

  console.log("\nVerify with:");
  console.log(`  npx hardhat verify --network ${net} ${address} "${usdm}"`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
