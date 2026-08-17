/**
 * Exercises the real holder journey against a local chain and asserts the
 * numbers, so the UI is never the thing being trusted to prove the economics.
 *
 *   npm run chain           # terminal 1
 *   npm run contracts:deploy
 *   npm run contracts:verify-flow
 *
 * What it proves:
 *   1. an investor can buy a business with ETH
 *   2. GOLD accrues at exactly the advertised rate
 *   3. claiming mints that GOLD to the holder
 *   4. selling settles correctly — the seller keeps what they earned and the
 *      buyer inherits nothing, which is the one place this design could
 *      quietly cheat somebody
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, createWalletClient, formatEther, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RPC_URL = process.env.RPC_URL ?? "http://127.0.0.1:8545";

const KEYS = {
  alice: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  bob: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
};

const DAY = 86_400;
const ONE_GOLD = 10n ** 18n;

/* ---------------------------------------------------------------- setup --- */

const abi = (name) =>
  JSON.parse(readFileSync(join(ROOT, "contracts", "out", `${name}.json`), "utf8")).abi;

const deploymentsPath = join(ROOT, "src", "lib", "web3", "deployments.json");
if (!existsSync(deploymentsPath)) {
  console.error("No deployments.json — run `npm run contracts:deploy` first.");
  process.exit(1);
}

const transport = http(RPC_URL);
const publicClient = createPublicClient({ transport });
const chainId = await publicClient.getChainId();

const deployment = JSON.parse(readFileSync(deploymentsPath, "utf8"))[String(chainId)];
if (!deployment) {
  console.error(`No deployment recorded for chain ${chainId}.`);
  process.exit(1);
}

const NFT = { address: deployment.contracts.minerFiNft, abi: abi("MinerFiNFT") };
const GOLD = { address: deployment.contracts.goldToken, abi: abi("GoldToken") };
const REWARDS = { address: deployment.contracts.goldRewards, abi: abi("GoldRewards") };

const alice = privateKeyToAccount(KEYS.alice);
const bob = privateKeyToAccount(KEYS.bob);
const wallet = (account) => createWalletClient({ account, transport });

/* ------------------------------------------------------------- helpers --- */

let failures = 0;

function check(label, actual, expected, tolerance = 0n, fmt = gold) {
  const diff = actual > expected ? actual - expected : expected - actual;
  const ok = diff <= tolerance;
  if (!ok) failures++;
  const shown = `${fmt(actual)}${tolerance > 0n ? ` (expected ~${fmt(expected)})` : ""}`;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label.padEnd(46)} ${shown}`);
}

const gold = (v) => `${Number(v) / 1e18} GOLD`;
const count = (v) => String(v);

async function send(account, contract, functionName, args = [], value) {
  const hash = await wallet(account).writeContract({
    ...contract,
    functionName,
    args,
    value,
    chain: null,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") throw new Error(`${functionName} reverted`);
  return receipt;
}

const read = (contract, functionName, args = []) =>
  publicClient.readContract({ ...contract, functionName, args });

/** Pushes the chain clock forward — the only way to test a time-based yield. */
async function advance(seconds) {
  await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "evm_increaseTime", params: [seconds] }),
  });
  await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "evm_mine", params: [] }),
  });
}

/**
 * Each transaction mines a block and moves the clock a second or two, so an
 * exact equality assertion would be flaky by design. A minute of drift is far
 * below anything that could hide a real accounting bug.
 */
const DRIFT = (rate) => (rate * 120n) / BigInt(DAY);

/* ----------------------------------------------------------------- run ---- */

console.log(`chain ${chainId} · nft ${NFT.address}\n`);

/* 1 — buy ------------------------------------------------------------------ */
console.log("1. Investor buys a Tier 1 Coffee Shop");

const tier1 = await read(NFT, "tierInfo", [1]);
const price = tier1.price;
const ratePerDay = tier1.goldPerDay;

console.log(`     price ${formatEther(price)} ETH · yield ${gold(ratePerDay)}/day`);

await send(alice, NFT, "mint", [1, 1n], price);

const aliceTokens = await read(NFT, "tokensOfOwner", [alice.address]);
check("alice owns 1 business", BigInt(aliceTokens.length), 1n, 0n, count);

const tokenId = aliceTokens[0];
check("token tier is 1", BigInt(await read(NFT, "tierOf", [tokenId])), 1n, 0n, count);
check("nothing accrued at mint", await read(REWARDS, "pendingOf", [tokenId]), 0n, DRIFT(ratePerDay));

/* 2 — accrue --------------------------------------------------------------- */
console.log("\n2. One day passes");
await advance(DAY);

check("pending after 1 day", await read(REWARDS, "pendingOf", [tokenId]), ratePerDay, DRIFT(ratePerDay));

/* 3 — claim ---------------------------------------------------------------- */
console.log("\n3. Holder claims");

check("GOLD balance before claim", await read(GOLD, "balanceOf", [alice.address]), 0n);
await send(alice, REWARDS, "claim");

const aliceGold = await read(GOLD, "balanceOf", [alice.address]);
check("GOLD balance after claim", aliceGold, ratePerDay, DRIFT(ratePerDay));
check("clock reset — pending back to 0", await read(REWARDS, "pendingOf", [tokenId]), 0n, DRIFT(ratePerDay));
check("total GOLD supply == claimed", await read(GOLD, "totalSupply"), aliceGold);

/* 4 — sell ----------------------------------------------------------------- */
console.log("\n4. Half a day later, alice sells the business to bob");
await advance(DAY / 2);

const halfDay = ratePerDay / 2n;
await send(alice, NFT, "transferFrom", [alice.address, bob.address, tokenId]);

check("alice credited for time she held it", await read(REWARDS, "credited", [alice.address]), halfDay, DRIFT(ratePerDay));
check("bob inherits nothing", await read(REWARDS, "pendingOf", [tokenId]), 0n, DRIFT(ratePerDay));
check("bob owns the business", BigInt((await read(NFT, "tokensOfOwner", [bob.address])).length), 1n, 0n, count);
check("alice owns nothing", BigInt((await read(NFT, "tokensOfOwner", [alice.address])).length), 0n, 0n, count);

/* 5 — both claim ----------------------------------------------------------- */
console.log("\n5. Another day passes, both claim");
await advance(DAY);

check("bob claimable", await read(REWARDS, "claimableOf", [bob.address]), ratePerDay, DRIFT(ratePerDay));
check("alice claimable (sold, still owed)", await read(REWARDS, "claimableOf", [alice.address]), halfDay, DRIFT(ratePerDay));

await send(bob, REWARDS, "claim");
await send(alice, REWARDS, "claim");

check("bob GOLD", await read(GOLD, "balanceOf", [bob.address]), ratePerDay, DRIFT(ratePerDay));
check("alice GOLD", await read(GOLD, "balanceOf", [alice.address]), ratePerDay + halfDay, DRIFT(ratePerDay));
check("alice credit drained", await read(REWARDS, "credited", [alice.address]), 0n);

/* 6 — dashboard + metadata -------------------------------------------------- */
console.log("\n6. Reads the app depends on");

const stats = await read(REWARDS, "holderStats", [bob.address]);
check("holderStats nftCount", stats[0], 1n, 0n, count);
check("holderStats goldPerDay", stats[1], ratePerDay);
check("holderStats goldBalance", stats[4], await read(GOLD, "balanceOf", [bob.address]));

const uri = await read(NFT, "tokenURI", [tokenId]);
const meta = JSON.parse(Buffer.from(uri.split(",")[1], "base64").toString());
console.log(`  ${meta.name.startsWith("Coffee Shop #") ? "PASS" : "FAIL"}  on-chain metadata name${" ".repeat(24)}${meta.name}`);
if (!meta.name.startsWith("Coffee Shop #")) failures++;
console.log(`  ${meta.image.startsWith("data:image/svg+xml;base64,") ? "PASS" : "FAIL"}  on-chain SVG image`);
if (!meta.image.startsWith("data:image/svg+xml;base64,")) failures++;

/* 7 — guards ---------------------------------------------------------------- */
console.log("\n7. Guards");

async function expectRevert(label, fn) {
  try {
    await fn();
    failures++;
    console.log(`  FAIL  ${label} — expected a revert`);
  } catch {
    console.log(`  PASS  ${label}`);
  }
}

await expectRevert("underpaying the mint reverts", () =>
  send(bob, NFT, "mint", [1, 1n], price - 1n),
);
await expectRevert("claiming with nothing accrued reverts", () =>
  send(privateKeyToAccount("0x" + "7".repeat(64)), REWARDS, "claim"),
);
await expectRevert("only the NFT contract can settle", () =>
  send(bob, REWARDS, "settle", [tokenId, bob.address]),
);
await expectRevert("only the rewards contract can mint GOLD", () =>
  send(bob, GOLD, "mint", [bob.address, parseEther("1000000")]),
);

/* --------------------------------------------------------------- verdict -- */

console.log(
  failures === 0
    ? "\nAll checks passed. The buy → accrue → claim → sell loop is sound."
    : `\n${failures} check(s) FAILED.`,
);
process.exit(failures === 0 ? 0 : 1);
