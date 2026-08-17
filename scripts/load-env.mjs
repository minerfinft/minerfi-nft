/**
 * Makes the env files visible to the contract scripts.
 *
 * Imported for its side effect at the top of anything that reads
 * DEPLOYER_PRIVATE_KEY or RPC_URL. Without it a key sitting in a file is simply
 * ignored and the deploy fails claiming no key was given, which sends you
 * looking in the wrong place entirely.
 *
 * **The deployer key belongs in `.env.deploy`, not `.env`.** Next.js auto-loads
 * `.env` and `.env.local`, and Turbopack snapshots what it loads into its build
 * cache for invalidation — which means a private key in `.env` ends up written
 * verbatim into `.next/cache`, a directory nobody thinks of as secret-bearing
 * and which does get copied into Docker contexts and CI artifacts. Next.js only
 * recognises a fixed set of filenames, so `.env.deploy` is never read by the
 * app and never reaches that cache. Verified by scanning the build output.
 *
 * dotenv does not overwrite variables already in the environment, so an
 * explicit `RPC_URL=… npm run …` still beats both files. That is the order
 * people expect, and it makes a one-off deploy to a different chain safe to run
 * against a repo configured for another.
 */

import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Secrets first, then shared config. Neither overrides the real environment. */
export const DEPLOY_ENV_FILE = join(ROOT, ".env.deploy");

for (const file of [DEPLOY_ENV_FILE, join(ROOT, ".env")]) {
  if (existsSync(file)) dotenv.config({ path: file, quiet: true });
}
