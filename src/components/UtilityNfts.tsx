import { NFT_TYPES, type NftType } from "@/lib/data";
import { Icon } from "./ui/Icon";
import { Reveal } from "./ui/Reveal";
import { Section, SectionHeading } from "./ui/Section";

/* Each NFT class gets one of the reference's flat fills, so the seven types stay
   tellable apart at a glance. Labels stay ink — only the tile carries the hue. */
const FILL: Record<NftType["accent"], string> = {
  green: "bg-green/30",
  deep: "bg-green-deep/25",
  mint: "bg-mint/40",
  amber: "bg-amber/40",
  coral: "bg-coral/45",
};

function NftCard({ nft, wide = false }: { nft: NftType; wide?: boolean }) {
  return (
    <article className="card-hard lift group relative flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <span
          className={`grid size-12 shrink-0 place-items-center rounded-lg border-[1.5px] border-line text-ink ${FILL[nft.accent]}`}
        >
          <Icon name={nft.icon} className="size-6" />
        </span>
        <span className="mt-1 font-mono text-[0.6rem] tracking-[0.16em] text-ink-faint uppercase">
          Utility
        </span>
      </div>

      <h3 className="mt-5 font-display text-[1.4rem] tracking-wide text-ink uppercase">
        {nft.name}
      </h3>
      <p className="mt-1 text-[0.82rem] font-semibold text-accent">
        {nft.tagline}
      </p>
      {/* flex-1 absorbs the slack so every card's stat block lands on the same line */}
      <p
        className={`mt-3 flex-1 text-[0.86rem] leading-relaxed text-ink-soft ${wide ? "max-w-lg" : ""}`}
      >
        {nft.description}
      </p>

      {/* Wide card has room for columns; the narrow ones read better as rows,
          which also keeps long values like "Paid in $MINE" from wrapping. */}
      <dl
        className={`mt-6 border-t-[1.5px] border-dashed border-line-soft pt-5 ${
          wide ? "grid grid-cols-3 gap-3" : "flex flex-col gap-2.5"
        }`}
      >
        {nft.stats.map((s) => (
          <div
            key={s.label}
            className={wide ? "min-w-0" : "flex items-baseline justify-between gap-4"}
          >
            <dt className="text-[0.65rem] tracking-[0.1em] text-ink-faint uppercase">
              {s.label}
            </dt>
            <dd
              className={`font-mono text-[0.78rem] font-semibold text-ink ${
                wide ? "mt-1" : "text-right"
              }`}
            >
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export function UtilityNfts() {
  const [featured, ...rest] = NFT_TYPES;

  return (
    <Section id="utility">
      <SectionHeading
        eyebrow="Utility NFT"
        eyebrowIcon="sparkles"
        title="Seven asset classes,"
        accent="each with a job"
        description="Remove any one of these and something in your business stops working. That is the whole design brief — the token is the mechanic, not a picture bolted onto one."
        aside={
          <div className="shadow-hard -rotate-2 rounded-lg border-[1.5px] border-line bg-coral/45 px-5 py-4 transition-transform duration-300 hover:rotate-0">
            <p className="font-display text-[1.15rem] leading-tight tracking-wide text-ink uppercase">
              An NFT you can&rsquo;t use
              <br />
              is just a receipt.
            </p>
          </div>
        }
      />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal className="sm:col-span-2">
          <NftCard nft={featured} wide />
        </Reveal>

        {rest.map((nft, i) => (
          <Reveal key={nft.id} delay={(i + 1) * 0.05}>
            <NftCard nft={nft} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
