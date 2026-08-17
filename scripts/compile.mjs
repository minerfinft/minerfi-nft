/**
 * Compiles contracts/*.sol and emits both build artifacts and the ABI module
 * the frontend imports.
 *
 * Deliberately solc-direct rather than a framework: the whole job is three
 * files with no plugins, no fixtures and no test runner, and keeping it here
 * means the ABIs the app ships are provably the ones that were compiled.
 *
 *   node scripts/compile.mjs
 */

import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const solc = require("solc");

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONTRACTS_DIR = join(ROOT, "contracts");
const OUT_DIR = join(ROOT, "contracts", "out");
const ABI_FILE = join(ROOT, "src", "lib", "web3", "abis.ts");

/** Contracts we actually deploy. Order matters only for readability. */
const SOURCES = ["GoldToken.sol", "MinerFiNFT.sol", "GoldRewards.sol"];

/* --------------------------------------------------------------- imports -- */

/**
 * solc hands us bare import paths and expects file contents back. Package
 * imports (`@openzeppelin/...`) resolve through node's own resolver so the
 * pinned version in package.json is the one that gets compiled; anything else
 * is treated as relative to contracts/.
 */
function findImports(importPath) {
  try {
    const filePath = importPath.startsWith("@")
      ? require.resolve(importPath, { paths: [ROOT] })
      : join(CONTRACTS_DIR, importPath);

    return { contents: readFileSync(filePath, "utf8") };
  } catch (error) {
    return { error: `Could not resolve import "${importPath}": ${error.message}` };
  }
}

/* --------------------------------------------------------------- compile -- */

const input = {
  language: "Solidity",
  sources: Object.fromEntries(
    SOURCES.map((name) => [name, { content: readFileSync(join(CONTRACTS_DIR, name), "utf8") }]),
  ),
  settings: {
    optimizer: { enabled: true, runs: 200 },
    // viaIR keeps the on-chain SVG builder in MinerFiNFT under the stack limit.
    viaIR: true,
    // OpenZeppelin 5.6 uses `mcopy`, so Cancun is a floor rather than a choice.
    // Every L2 this is aimed at (Base, Optimism, Arbitrum) is post-Dencun.
    evmVersion: "cancun",
    outputSelection: {
      "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"] },
    },
  },
};

console.log(`solc ${solc.version()}`);
console.log(`compiling ${SOURCES.join(", ")}…`);

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

const diagnostics = output.errors ?? [];
const errors = diagnostics.filter((d) => d.severity === "error");

for (const warning of diagnostics.filter((d) => d.severity !== "error")) {
  console.warn(warning.formattedMessage);
}

if (errors.length > 0) {
  for (const error of errors) console.error(error.formattedMessage);
  console.error(`\n${errors.length} compile error(s).`);
  process.exit(1);
}

/* ------------------------------------------------------------ artifacts --- */

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(dirname(ABI_FILE), { recursive: true });

const compiled = {};

for (const source of SOURCES) {
  const name = source.replace(/\.sol$/, "");
  const contract = output.contracts?.[source]?.[name];

  if (!contract) {
    console.error(`Compiler produced no output for ${name} in ${source}.`);
    process.exit(1);
  }

  const bytecode = `0x${contract.evm.bytecode.object}`;
  compiled[name] = { abi: contract.abi, bytecode };

  writeFileSync(
    join(OUT_DIR, `${name}.json`),
    `${JSON.stringify({ contractName: name, abi: contract.abi, bytecode }, null, 2)}\n`,
  );

  const sizeKb = (contract.evm.deployedBytecode.object.length / 2 / 1024).toFixed(1);
  console.log(`  ${name.padEnd(14)} ${contract.abi.length} abi entries, ${sizeKb} KB deployed`);
}

/* ----------------------------------------------------------- abis.ts ------ */

const banner = `/**
 * GENERATED FILE — do not edit by hand.
 * Run \`npm run contracts:compile\` after changing anything in contracts/.
 *
 * \`as const\` is what gives wagmi/viem full type inference on every read and
 * write in the app, so a renamed function breaks the typecheck instead of
 * failing silently at runtime.
 */
`;

const body = Object.entries(compiled)
  .map(([name, { abi }]) => {
    const constName = `${name.replace(/^./, (c) => c.toLowerCase())}Abi`;
    return `export const ${constName} = ${JSON.stringify(abi, null, 2)} as const;\n`;
  })
  .join("\n");

writeFileSync(ABI_FILE, `${banner}\n${body}`);

console.log(`\nartifacts → contracts/out/`);
console.log(`abis      → src/lib/web3/abis.ts`);
