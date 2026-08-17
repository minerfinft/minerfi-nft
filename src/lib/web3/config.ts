import { createConfig, http } from "wagmi";
import { hardhat, robinhood, robinhoodTestnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import deployments from "./deployments.json";

/**
 * Chains the app will talk to.
 *
 * MinerFi targets Robinhood Chain — an Arbitrum Orbit L2, chain 4663, with its
 * testnet on 46630. Both definitions come from viem rather than being
 * hand-rolled, so the RPC, explorer and Multicall3 address are the canonical
 * ones and a wallet prompted to add the network gets the same parameters it
 * would from any other app.
 *
 * `hardhat` stays in the list for local development. Base Sepolia was the
 * original target and has been dropped: nothing is deployed there, so its only
 * effect was to offer a "wrong network" state that led nowhere.
 *
 * Order matters — DEFAULT_CHAIN picks the first entry that has contracts.
 *
 * `injected` is the only connector on purpose. It covers MetaMask, Rabby,
 * Brave and every other extension wallet with no extra dependency and no
 * project id to register — WalletConnect can be added later without touching
 * anything downstream of this file.
 */
export const SUPPORTED_CHAINS = [robinhoodTestnet, robinhood, hardhat] as const;

/** The literal ids wagmi is configured for — 46630 | 4663 | 31337, not `number`. */
export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]["id"];

export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    // Empty http() falls back to the chain definition's own RPC, so the app
    // works from a fresh clone. Set the env var to point at a private endpoint.
    [robinhoodTestnet.id]: http(process.env.NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL),
    [robinhood.id]: http(process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
  // Without this, wagmi restores wallet state during SSR and React screams
  // about a hydration mismatch on every page load.
  ssr: true,
});

/**
 * The chains MinerFi is actually launched on.
 *
 * `hardhat` is excluded on purpose. It is a developer's local node, and it can
 * never be the answer to "which network should I be on" — nobody but the person
 * running `npm run chain` can reach it, so advertising it in the UI would be
 * telling every visitor to switch to a network that does not exist for them.
 */
const LAUNCH_CHAINS = [robinhoodTestnet, robinhood] as const;

/**
 * Where to send a user whose wallet is on the wrong network, and the chain the
 * app reads from before a wallet is connected.
 *
 * Robinhood Chain always, never the local node. Which of the two Robinhood
 * chains is decided by what is deployed, so a testnet build and a mainnet build
 * both "just work" — and before either exists it still names the testnet, which
 * is the honest answer to "where is this going to run".
 *
 * The env override is the deliberate opt-in for local development, and is the
 * only way `hardhat` ever becomes the default.
 */
const PREFERRED_CHAIN_ID = Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID);

export const DEFAULT_CHAIN =
  SUPPORTED_CHAINS.find((chain) => chain.id === PREFERRED_CHAIN_ID) ??
  LAUNCH_CHAINS.find((chain) => String(chain.id) in deployments) ??
  robinhoodTestnet;

/**
 * Narrows an arbitrary chain id to one the app has a transport for.
 *
 * A wallet reports whatever network it is on, and deployments.json could
 * name a chain wagmi was never given an RPC for. Both cases have to be filtered
 * before an id reaches a read, or wagmi is asked to call a chain it cannot
 * reach and the query fails rather than falling back.
 */
export function isSupportedChainId(id: number | undefined): id is SupportedChainId {
  return SUPPORTED_CHAINS.some((chain) => chain.id === id);
}

export function chainName(chainId: number | undefined) {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId)?.name ?? "Unknown network";
}

/** True for chains whose ETH is play money, which the UI says out loud. */
export function isTestnet(chainId: number | undefined) {
  return Boolean(SUPPORTED_CHAINS.find((chain) => chain.id === chainId)?.testnet);
}

/** Block explorer link for a tx, or null on a local chain that has none. */
export function explorerTxUrl(chainId: number | undefined, hash: string) {
  const base = SUPPORTED_CHAINS.find((chain) => chain.id === chainId)?.blockExplorers?.default.url;
  return base ? `${base}/tx/${hash}` : null;
}

/** Block explorer link for a contract or wallet, or null on a local chain. */
export function explorerAddressUrl(chainId: number | undefined, address: string) {
  const base = SUPPORTED_CHAINS.find((chain) => chain.id === chainId)?.blockExplorers?.default.url;
  return base ? `${base}/address/${address}` : null;
}

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
