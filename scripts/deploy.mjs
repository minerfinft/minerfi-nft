/**
 * Deploys the GOLD stack and wires the three contracts together.
 *
 *   npm run contracts:deploy                # local hardhat node (127.0.0.1:8545)
 *
 *   # Robinhood Chain Testnet (chain 46630)
 *   RPC_URL=https://rpc.testnet.chain.robinhood.com \
 *   DEPLOYER_PRIVATE_KEY=0x… npm run contracts:deploy
 *
 * The key must be a throwaway that only ever holds testnet funds, and it is
 * read from the environment rather than any file so it cannot be committed by
 * accident.
 *
 * Addresses land in src/lib/web3/deployments.json, keyed by chain id, which is
 * what the app reads at runtime. Committing that file is what lets somebody
 * clone the repo and have a working app without a setup checklist.
 */

import "./load-env.mjs";

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, createWalletClient, formatEther, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "contracts", "out");
const DEPLOYMENTS_FILE = join(ROOT, "src", "lib", "web3", "deployments.json");

/* ------------------------------------------------------------------ env --- */

const RPC_URL = process.env.RPC_URL ?? "http://127.0.0.1:8545";
const IS_LOCAL = /127\.0\.0\.1|localhost/.test(RPC_URL);

/** Hardhat's first well-known account. Public by design — local chains only. */
const HARDHAT_ACCOUNT_0 = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? (IS_LOCAL ? HARDHAT_ACCOUNT_0 : null);

if (!PRIVATE_KEY) {
  console.error(
    "DEPLOYER_PRIVATE_KEY is required for a non-local RPC.\n" +
      "Use a throwaway key that only ever holds testnet funds.",
  );
  process.exit(1);
}

/**
 * Live prices from the game design are 0.05 – 7.50 ETH. A testnet faucet hands
 * out roughly 0.05 ETH, so shipping those numbers would make tiers 2-5
 * unreachable and the flow untestable. Dividing keeps the whole ladder
 * buyable; set to 1 for a mainnet deploy.
 */
const PRICE_DIVISOR = BigInt(process.env.MINT_PRICE_DIVISOR ?? (IS_LOCAL ? 1 : 1000));

/* ---------------------------------------------------------------- tiers --- */

const TIERS = [
  { name: "Coffee Shop", price: "0.05", goldPerDay: 120n, maxSupply: 10_000n },
  { name: "Restaurant", price: "0.18", goldPerDay: 480n, maxSupply: 5_000n },
  { name: "Hotel", price: "0.60", goldPerDay: 1_750n, maxSupply: 2_000n },
  { name: "Corporation", price: "2.10", goldPerDay: 6_400n, maxSupply: 500n },
  { name: "Global Empire", price: "7.50", goldPerDay: 24_000n, maxSupply: 100n },
];

const prices = TIERS.map((t) => parseEther(t.price) / PRICE_DIVISOR);
const goldPerDay = TIERS.map((t) => t.goldPerDay * 10n ** 18n);
const maxSupplies = TIERS.map((t) => t.maxSupply);

/* ------------------------------------------------------------ artifacts --- */

function artifact(name) {
  const path = join(OUT_DIR, `${name}.json`);
  if (!existsSync(path)) {
    console.error(`Missing ${name}.json — run \`npm run contracts:compile\` first.`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

const GoldToken = artifact("GoldToken");
const MinerFiNFT = artifact("MinerFiNFT");
const GoldRewards = artifact("GoldRewards");

/* --------------------------------------------------------------- clients -- */

const account = privateKeyToAccount(PRIVATE_KEY);
const transport = http(RPC_URL);

const publicClient = createPublicClient({ transport });
const chainId = await publicClient.getChainId();
const walletClient = createWalletClient({ account, transport });

const balance = await publicClient.getBalance({ address: account.address });

console.log(`rpc       ${RPC_URL}`);
console.log(`chain id  ${chainId}`);
console.log(`deployer  ${account.address}`);
console.log(`balance   ${formatEther(balance)} ETH`);

/* --------------------------------------------------------------- deploy --- */

async function deploy(label, { abi, bytecode }, args) {
  const hash = await walletClient.deployContract({ abi, bytecode, args, chain: null });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status !== "success" || !receipt.contractAddress) {
    throw new Error(`${label} deployment reverted (tx ${hash})`);
  }

  console.log(`  ${label.padEnd(12)} ${receipt.contractAddress}`);
  return receipt.contractAddress;
}

async function send(label, address, abi, functionName, args) {
  const hash = await walletClient.writeContract({
    address,
    abi,
    functionName,
    args,
    chain: null,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status !== "success") {
    throw new Error(`${label} reverted (tx ${hash})`);
  }

  console.log(`  ${label}`);
}

async function deployEverything() {
  console.log(`prices    ${prices.map((p) => formatEther(p)).join(", ")} ETH\n`);

  console.log("deploying…");
  const goldAddress = await deploy("GoldToken", GoldToken, [account.address]);
  const nftAddress = await deploy("MinerFiNFT", MinerFiNFT, [
    account.address,
    prices,
    goldPerDay,
    maxSupplies,
  ]);
  const rewardsAddress = await deploy("GoldRewards", GoldRewards, [nftAddress, goldAddress]);

  // Order matters: until both of these land, minting works but nothing accrues.
  console.log("\nwiring…");
  await send("GoldToken.setMinter → GoldRewards", goldAddress, GoldToken.abi, "setMinter", [
    rewardsAddress,
  ]);
  await send("MinerFiNFT.setRewards → GoldRewards", nftAddress, MinerFiNFT.abi, "setRewards", [
    rewardsAddress,
  ]);

  /* --------------------------------------------------------- bookkeeping -- */

  const existing = existsSync(DEPLOYMENTS_FILE)
    ? JSON.parse(readFileSync(DEPLOYMENTS_FILE, "utf8"))
    : {};

  existing[String(chainId)] = {
    chainId,
    deployedAt: new Date().toISOString(),
    deployer: account.address,
    blockNumber: Number(await publicClient.getBlockNumber()),
    contracts: {
      goldToken: goldAddress,
      minerFiNft: nftAddress,
      goldRewards: rewardsAddress,
    },
  };

  writeFileSync(DEPLOYMENTS_FILE, `${JSON.stringify(existing, null, 2)}\n`);

  console.log(`\nsaved → src/lib/web3/deployments.json (chain ${chainId})`);
  console.log("The app picks these up on the next request. No env vars needed.");
}

/**
 * `process.exitCode` rather than `process.exit()`.
 *
 * Tearing the process down while viem's HTTP transport still holds a socket
 * aborts the Node runtime on Windows — `Assertion failed: !(handle->flags &
 * UV_HANDLE_CLOSING)` — which reports **127** instead of 1. An ordinary "you
 * have no ETH" then looks like a crash, and any CI step gating on the exit code
 * reads the wrong thing. Setting the code and letting the event loop drain
 * gives the same result cleanly.
 */
if (balance === 0n) {
  console.error("\nDeployer has no ETH. Fund it before deploying.");
  process.exitCode = 1;
} else {
  await deployEverything();
}
