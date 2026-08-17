/**
 * Hardhat is used here for exactly one thing: `npx hardhat node`, a local
 * EVM at 127.0.0.1:8545 with funded accounts so the mint → accrue → claim
 * flow can be exercised end to end without a faucet.
 *
 * Compilation and deployment are handled by scripts/compile.mjs and
 * scripts/deploy.mjs, which talk to solc and viem directly.
 */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: { optimizer: { enabled: true, runs: 200 }, viaIR: true, evmVersion: "cancun" },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      // OpenZeppelin 5.6 emits `mcopy`; a pre-Cancun fork rejects it.
      hardfork: "cancun",
      // Blocks only move when a transaction arrives, which would freeze the
      // accrual clock. Mining on an interval makes GOLD tick like a real chain.
      mining: { auto: true, interval: 2000 },
    },
  },
};
