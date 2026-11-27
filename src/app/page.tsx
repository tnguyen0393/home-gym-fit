import Link from "next/link";
import { ArticleList } from "@/components/ArticleList";
import { ArtworkImage } from "@/components/ArtworkImage";
import { primaryButtonClass, secondaryButtonClass } from "@/components/styles";
import { categoryArt, heroArt } from "@/lib/artwork";
import { listGuides } from "@/lib/content";
import { fitPresets } from "@/lib/fit";
import { formatDisplayDate } from "@/lib/format";
import { catalogStats, getProducts } from "@/lib/products";
import { pageMetadata } from "@/lib/site";
import type { ProductCategory } from "@/lib/types";

const popularSlugs = [
  "folding-power-racks-8-foot-ceiling",
  "renter-friendly-squat-racks",
  "best-short-olympic-barbells",
  "best-adjustable-dumbbells-for-apartments",
];

export const metadata = pageMetadata(
  "Home Gym Fit",
  "Manufacturer-published dimensions for compact and folding racks, short rackable barbells, vertical-storage benches, and adjustable dumbbells.",
  "/",
);

export default function HomePage() {
  const products = getProducts();
  const stats = catalogStats(products);
  const verticalBenches = products.filter((product) => product.bench_specs?.vertical_storage === true);
  const dumbbells = products.filter((product) => product.category === "dumbbell");
  const guides = listGuides();
  const picked = popularSlugs.flatMap((slug) => {
    const guide = guides.find((article) => article.slug === slug);
    return guide ? [guide] : [];
  });
  const popular = picked.length > 0 ? picked : guides.slice(0, 3);

  const categories: ProductCategory[] = ["rack", "barbell", "bench", "dumbbell"];

  return (
    <div className="flex flex-col gap-10">
      <header className="grid items-center gap-6 lg:grid-cols-2">
        <div className="flex max-w-prose flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Compact home-gym fit directory
          </h1>
          <p className="text-lg text-stone-700">
            Manufacturer-published dimensions for apartment and low-ceiling racks, short barbells that
            fit them, benches that store upright, and adjustable dumbbells. If a number was not
            published, it stays unverified.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/directory/" className={primaryButtonClass}>
              Browse directory
            </Link>
            <Link href="/guides/" className={secondaryButtonClass}>
              Read fit guides
            </Link>
          </div>
        </div>
        <ArtworkImage
          art={heroArt}
          priority
          className="h-auto w-full rounded-lg border border-stone-200 bg-stone-50"
        />
      </header>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Browse by equipment</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const art = categoryArt[category];
            const count =
              category === "bench"
                ? verticalBenches.length
                : products.filter((product) => product.category === category).length;
            return (
              <li key={category}>
                <Link
                  href={art.href}
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-stone-200 bg-white hover:border-indigo-300"
                >
                  <ArtworkImage art={art} className="h-auto w-full bg-stone-50" />
                  <span className="flex flex-1 flex-col gap-1 p-4">
                    <span className="font-semibold text-stone-950 group-hover:text-indigo-800">
                      {art.label}
                    </span>
                    <span className="text-sm text-stone-600">{art.summary}</span>
                    <span className="mt-2 text-sm font-semibold tabular-nums text-indigo-800">
                      {count} {count === 1 ? "product" : "products"}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      <div className="flex flex-col gap-2">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-stone-200 bg-stone-200 sm:grid-cols-3 lg:grid-cols-5">
          <Stat label="Products" value={String(stats.total)} />
          <Stat label="Racks" value={String(stats.byCategory.rack)} />
          <Stat label="Short barbells" value={String(stats.byCategory.barbell)} />
          <Stat label="Vertical benches" value={String(verticalBenches.length)} />
          <Stat label="Dumbbells" value={String(stats.byCategory.dumbbell)} />
        </dl>
        <p className="text-sm text-stone-600">
          {stats.total} products: {stats.byCategory.rack} racks, {stats.byCategory.barbell} short
          barbells, {verticalBenches.length} vertical benches, and {stats.byCategory.dumbbell}{" "}
          adjustable dumbbells.
          {" · "}
          {stats.brands} brands
          {" · "}
          {stats.noWallMount} with no wall mount
          {" · "}
          Last checked {stats.latestVerified ? formatDisplayDate(stats.latestVerified) : "not recorded"}
        </p>
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Fit presets</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fitPresets.map((preset) => {
            const count = products.filter(preset.matches).length;
            return (
              <li key={preset.slug}>
                <Link
                  href={`/fit/${preset.slug}/`}
                  className="group flex h-full items-start justify-between gap-3 rounded-lg border border-stone-200 bg-white p-4 hover:border-indigo-300 hover:bg-indigo-50/60"
                >
                  <span>
                    <span className="block font-semibold text-stone-950 group-hover:text-indigo-800">
                      {preset.title}
                    </span>
                    <span className="mt-1 block text-sm text-stone-600">{preset.summary}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span
                      className="rounded-full bg-indigo-50 px-2 py-0.5 text-sm font-semibold text-indigo-950 tabular-nums"
                      aria-label={`${count} products`}
                    >
                      {count}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-indigo-800 transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href="/directory/?category=bench&vertical=1"
              className="group flex h-full items-start justify-between gap-3 rounded-lg border border-stone-200 bg-white p-4 hover:border-indigo-300 hover:bg-indigo-50/60"
            >
              <span>
                <span className="block font-semibold text-stone-950 group-hover:text-indigo-800">
                  Vertical-storage benches
                </span>
                <span className="mt-1 block text-sm text-stone-600">
                  Benches that store upright. Stored size stays unpublished when the manufacturer
                  did not print it.
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span
                  className="rounded-full bg-indigo-50 px-2 py-0.5 text-sm font-semibold text-indigo-950 tabular-nums"
                  aria-label={`${verticalBenches.length} products`}
                >
                  {verticalBenches.length}
                </span>
                <span
                  aria-hidden="true"
                  className="text-indigo-800 transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/directory/?category=dumbbell"
              className="group flex h-full items-start justify-between gap-3 rounded-lg border border-stone-200 bg-white p-4 hover:border-indigo-300 hover:bg-indigo-50/60"
            >
              <span>
                <span className="block font-semibold text-stone-950 group-hover:text-indigo-800">
                  Adjustable dumbbells
                </span>
                <span className="mt-1 block text-sm text-stone-600">
                  Pairs with a published weight range, max length, and tray when the manufacturer
                  prints one.
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span
                  className="rounded-full bg-indigo-50 px-2 py-0.5 text-sm font-semibold text-indigo-950 tabular-nums"
                  aria-label={`${dumbbells.length} products`}
                >
                  {dumbbells.length}
                </span>
                <span
                  aria-hidden="true"
                  className="text-indigo-800 transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </span>
            </Link>
          </li>
        </ul>
      </section>
      {popular.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Popular fit guides</h2>
          <ArticleList articles={popular} />
        </section>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-4 py-3">
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd className="text-xl font-semibold text-stone-950 tabular-nums">{value}</dd>
    </div>
  );
}
