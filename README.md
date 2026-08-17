# MinerFi

A Web3 business tycoon game where the NFT is the business. Every deed is a
running shop at one of five tiers, and the tier is what the rewards contract
reads to decide what its holder is owed. Buy a business, it produces GOLD every
second you hold it, claim whenever you like, sell whenever you like.

Target chain: **Robinhood Chain** — an Arbitrum L2 using ETH for gas.
Mainnet is `4663`, testnet is `46630`.

## The three contracts

| Contract | What it is |
| --- | --- |
| `MinerFiNFT` | ERC-721 business deeds. Five tiers, on-chain SVG metadata, and a transfer hook that settles rewards before ownership moves. |
| `GoldToken` | ERC-20 GOLD. Minted only by the rewards contract, only at claim time. |
| `GoldRewards` | Accrual and claiming. `pending = (now − lastAccrual) × goldPerDay ÷ 1 day`. |

There is no staking and no reward pool. The deed stays in the holder's wallet,
stays listable, and earns the whole time — GOLD is minted at claim for exactly
the seconds that were actually held.

## Run it locally

Three terminals:

```bash
npm run chain
```

```bash
npm run contracts:compile && npm run contracts:deploy
```

```bash
NEXT_PUBLIC_DEFAULT_CHAIN_ID=31337 npm run dev
```

That variable is the one piece of local setup that is not optional: the app
targets Robinhood Chain by default and will otherwise point past your local node
at a network with nothing deployed on it.

The deploy writes addresses to `src/lib/web3/deployments.json`, which is what
the app reads at runtime. Open
[localhost:3000/app](http://localhost:3000/app).

## Deploy to Robinhood Chain Testnet

First check the chain will take the contracts. This only reads, so it is safe
to run against anything:

```bash
RPC_URL=https://rpc.testnet.chain.robinhood.com npm run contracts:preflight
```

Then you need a deployer key with ETH on it. Robinhood's guide recommends a
throwaway rather than reusing a real wallet, so there is a command for it:

```bash
npm run deployer:new
```

It writes the key to `.env.deploy` without ever printing it, and shows you the
address to fund. Already have a funded testnet key? Put it in `.env.deploy` as
`DEPLOYER_PRIVATE_KEY` instead and skip this.

> **Not `.env`.** Next.js auto-loads `.env`, and Turbopack copies what it loads
> into `.next/cache` — a key there gets written verbatim into a build directory
> that ends up in Docker contexts and CI artifacts. Next.js does not recognise
> the name `.env.deploy`, so a key there never reaches the build. Both files are
> gitignored.

Then deploy:

```bash
RPC_URL=https://rpc.testnet.chain.robinhood.com npm run contracts:deploy
```

Then re-run the preflight — it now checks that both contracts are wired to each
other and that every read the dashboard makes actually decodes:

```bash
RPC_URL=https://rpc.testnet.chain.robinhood.com npm run contracts:preflight
```

Commit the updated `deployments.json` and the app points at Robinhood testnet on
the next build. Nothing else changes.

### Getting testnet ETH

Robinhood Chain publishes no faucet. Testnet ETH is bridged over from Ethereum —
see [their bridging docs](https://docs.robinhood.com/chain/bridging).

Mint prices are divided by 1000 on any non-local chain (`MINT_PRICE_DIVISOR`),
so the whole tier ladder costs about 0.01 ETH rather than 10. Set it to `1` for
a mainnet deploy.

## Verify the economics

`verify-flow` exercises the real holder journey against a local chain and
asserts the numbers, so the UI is never the thing being trusted:

```bash
npm run contracts:verify-flow
```

It proves an investor can buy with ETH, that GOLD accrues at exactly the
advertised rate, that claiming mints it, and — the one place a design like this
could quietly cheat somebody — that selling settles correctly, with the seller
keeping what they earned and the buyer inheriting nothing.

## Environment

Everything is optional; see `.env.example`. The two worth knowing:

- `NEXT_PUBLIC_DEFAULT_CHAIN_ID` — the chain the app targets before a wallet is
  connected: the one it names when asking somebody to switch, and the one it
  reads from meanwhile. It defaults to Robinhood Chain and **never** to the local
  node, because "switch to my laptop" is not advice anyone can act on. Set it to
  `31337` when developing against `npm run chain`.
- `MINT_PRICE_DIVISOR` — deploy-time only, described above.

## Checks

```bash
npx tsc --noEmit && npx eslint src && npm run build
```
