/**
 * Checks that a chain can actually run MinerFi, and that a deployment on it is
 * live and wired correctly.
 *
 *   npm run contracts:preflight                     # local hardhat node
 *   RPC_URL=https://rpc.testnet.chain.robinhood.com npm run contracts:preflight
 *
 * Run it before deploying to find out whether the chain will take the
 * contracts, and after deploying to confirm the app will work against it. It
 * only ever reads, so it is safe to point at mainnet.
 *
 * Exits non-zero if anything the app depends on is missing, which makes it
 * usable as a release gate rather than something you have to read carefully.
 */

import "./load-env.mjs";

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, formatEther, formatGwei, http } from "viem";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RPC_URL = process.env.RPC_URL ?? "http://127.0.0.1:8545";

/* Kept in step with SUPPORTED_CHAINS in src/lib/web3/config.ts. A chain the
   frontend has no transport for cannot be reached from the app no matter what
   is deployed on it. */
const SUPPORTED = {
  4663: "Robinhood Chain",
  46630: "Robinhood Chain Testnet",
  31337: "Hardhat (local)",
};

/** Arbitrum's ArbSys precompile. Present on Orbit chains, absent elsewhere. */
const ARB_SYS = "0x0000000000000000000000000000000000000064";
/** ArbSys.arbOSVersion() — returns 55 + the real ArbOS version. */
const ARB_OS_VERSION_SELECTOR = "0x051038f2";
/** MCOPY, which OpenZeppelin 5.6 emits, landed in ArbOS 32. */
const MIN_ARB_OS = 32;

let failures = 0;
let warnings = 0;

const ok = (label, detail = "") => console.log(`  ok    ${label}${detail ? `  ${detail}` : ""}`);
const warn = (label, detail = "") => {
  console.log(`  warn  ${label}${detail ? `  ${detail}` : ""}`);
  warnings++;
};
const bad = (label, detail = "") => {
  console.log(`  FAIL  ${label}${detail ? `  ${detail}` : ""}`);
  failures++;
};

const abi = (name) => {
  const path = join(ROOT, "contracts", "out", `${name}.json`);
  if (!existsSync(path)) {
    console.error(`Missing ${name}.json — run \`npm run contracts:compile\` first.`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(path, "utf8")).abi;
};

const client = createPublicClient({ transport: http(RPC_URL) });

/* ----------------------------------------------------------------- chain -- */

console.log(`\nchain  ${RPC_URL}`);

let chainId;
try {
  chainId = await client.getChainId();
} catch (cause) {
  bad("RPC unreachable", cause.shortMessage ?? cause.message);
  console.log(`\n${failures} failed. Cannot continue without an RPC.\n`);
  process.exit(1);
}

ok("RPC responds", `chain ${chainId}`);

if (SUPPORTED[chainId]) {
  ok("chain is configured in the app", SUPPORTED[chainId]);
} else {
  bad(
    "chain is not in SUPPORTED_CHAINS",
    `add ${chainId} to src/lib/web3/config.ts or the app cannot reach it`,
  );
}

const [block, gasPrice] = await Promise.all([client.getBlockNumber(), client.getGasPrice()]);
ok("chain is producing blocks", `#${block} · gas ${formatGwei(gasPrice)} gwei`);

/* ------------------------------------------------------------------ evm --- */

// The contracts are compiled for Cancun and OpenZeppelin 5.6 emits MCOPY, so an
// Orbit chain below ArbOS 32 would accept the deployment and then revert.
const arbSysCode = await client.getCode({ address: ARB_SYS });

if (arbSysCode && arbSysCode !== "0x") {
  const raw = await client.call({ to: ARB_SYS, data: ARB_OS_VERSION_SELECTOR });
  const arbOs = Number(BigInt(raw.data)) - 55;

  if (arbOs >= MIN_ARB_OS) {
    ok("ArbOS supports Cancun opcodes", `ArbOS ${arbOs} (need ${MIN_ARB_OS}+)`);
  } else {
    bad("ArbOS too old for these contracts", `ArbOS ${arbOs}, need ${MIN_ARB_OS}+`);
  }
} else {
  ok("not an Orbit chain — no ArbOS floor to check");
}

/* --------------------------------------------------------------- deploy --- */

const deploymentsFile = join(ROOT, "src", "lib", "web3", "deployments.json");
const deployments = existsSync(deploymentsFile)
  ? JSON.parse(readFileSync(deploymentsFile, "utf8"))
  : {};
const record = deployments[String(chainId)];

if (!record) {
  console.log(`\ndeployment`);
  warn(
    "nothing deployed to this chain yet",
    `put a funded key in .env.deploy (npm run deployer:new), then:\n` +
      `        RPC_URL=${RPC_URL} npm run contracts:deploy`,
  );
  report();
}

console.log(`\ndeployment  ${record.deployedAt}`);

const { goldToken, minerFiNft, goldRewards } = record.contracts;

for (const [label, address] of Object.entries({ goldToken, minerFiNft, goldRewards })) {
  const code = await client.getCode({ address });
  if (code && code !== "0x") {
    ok(`${label} has code`, address);
  } else {
    bad(`${label} has NO code at the recorded address`, address);
  }
}

if (failures > 0) report();

/* ---------------------------------------------------------------- wiring -- */

console.log(`\nwiring`);

const goldAbi = abi("GoldToken");
const nftAbi = abi("MinerFiNFT");
const rewardsAbi = abi("GoldRewards");

// Both directions have to hold. With either missing, minting still works and
// nothing ever accrues — the worst possible failure mode, because it looks fine.
const minter = await client.readContract({
  address: goldToken,
  abi: goldAbi,
  functionName: "minter",
});
minter.toLowerCase() === goldRewards.toLowerCase()
  ? ok("GoldToken.minter → GoldRewards")
  : bad("GoldToken.minter is wrong", `${minter} (claims would revert)`);

const wiredRewards = await client.readContract({
  address: minerFiNft,
  abi: nftAbi,
  functionName: "rewards",
});
wiredRewards.toLowerCase() === goldRewards.toLowerCase()
  ? ok("MinerFiNFT.rewards → GoldRewards")
  : bad("MinerFiNFT.rewards is wrong", `${wiredRewards} (nothing would accrue)`);

/* ------------------------------------------------------- what the app reads */

console.log(`\napp reads`);

const tiers = await client.readContract({
  address: minerFiNft,
  abi: nftAbi,
  functionName: "allTiers",
});

if (tiers.length === 5) {
  ok("allTiers()", `${tiers.length} tiers`);
  for (const [i, t] of tiers.entries()) {
    const sold = t.maxSupply > 0n ? (t.minted * 100n) / t.maxSupply : 0n;
    console.log(
      `        T${i + 1} ${t.name.padEnd(14)} ${formatEther(t.price).padStart(10)} ETH` +
        `  ${(t.goldPerDay / 10n ** 18n).toString().padStart(6)} GOLD/day` +
        `  ${t.minted}/${t.maxSupply} (${sold}%)`,
    );
  }
} else {
  bad("allTiers() returned an unexpected shape", `${tiers.length} entries`);
}

const [supply, claimed, minted] = await client.readContract({
  address: goldRewards,
  abi: rewardsAbi,
  functionName: "protocolStats",
});
ok(
  "protocolStats()",
  `${formatEther(supply)} GOLD supply · ${formatEther(claimed)} claimed · ${minted} businesses`,
);

/* The two reads the dashboard makes on every load, exercised against the
   deployer so the call is proven to decode end to end.

   Not the zero address: both of these reach ERC721.balanceOf, which OpenZeppelin
   reverts on for address(0) with ERC721InvalidOwner. The app never asks — both
   hooks are gated on a connected address — but probing with it here would fail
   for a reason that has nothing to do with the deployment being healthy. */
const probe = record.deployer;

await client.readContract({
  address: goldRewards,
  abi: rewardsAbi,
  functionName: "holderStats",
  args: [probe],
});
ok("holderStats()", probe);

await client.readContract({
  address: goldRewards,
  abi: rewardsAbi,
  functionName: "portfolioOf",
  args: [probe],
});
ok("portfolioOf()", probe);

report();

function report() {
  console.log(
    `\n${failures} failed, ${warnings} warning${warnings === 1 ? "" : "s"}` +
      (failures === 0 && warnings === 0 ? " — ready" : ""),
  );
  console.log("");
  process.exit(failures === 0 ? 0 : 1);
}
