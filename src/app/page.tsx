import type { Metadata } from "next";
import Link from "next/link";
import { ArticleList } from "@/components/ArticleList";
import { primaryButtonClass, secondaryButtonClass } from "@/components/styles";
import { listGuides } from "@/lib/content";
import { fitPresets } from "@/lib/fit";
import { formatDisplayDate } from "@/lib/format";
import { catalogStats, getProducts } from "@/lib/products";

const popularSlugs = [
  "folding-power-racks-8-foot-ceiling",
  "renter-friendly-squat-racks",
  "best-short-olympic-barbells",
];

export const metadata: Metadata = {
  title: "Home Gym Fit",
  description:
    "Manufacturer-published dimensions for compact and folding racks, short rackable barbells, and vertical-storage benches.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const products = getProducts();
  const stats = catalogStats(products);
  const verticalBenches = products.filter((product) => product.bench_specs?.vertical_storage === true);
  const guides = listGuides();
  const picked = popularSlugs.flatMap((slug) => {
    const guide = guides.find((article) => article.slug === slug);
    return guide ? [guide] : [];
  });
  const popular = picked.length > 0 ? picked : guides.slice(0, 3);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex max-w-prose flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Compact home-gym fit directory
        </h1>
        <p className="text-lg text-stone-700">
          Manufacturer-published dimensions for apartment and low-ceiling racks, short barbells that
          fit them, and benches that store upright. If a number was not published, it stays
          unverified.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/directory/" className={primaryButtonClass}>
            Browse directory
          </Link>
          <Link href="/guides/" className={secondaryButtonClass}>
            Read fit guides
          </Link>
        </div>
      </header>
      <div className="flex flex-col gap-2">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-stone-200 bg-stone-200 sm:grid-cols-4">
          <Stat label="Products" value={String(stats.total)} />
          <Stat label="Racks" value={String(stats.byCategory.rack)} />
          <Stat label="Short barbells" value={String(stats.byCategory.barbell)} />
          <Stat label="Benches" value={String(stats.byCategory.bench)} />
        </dl>
        <p className="text-sm text-stone-600">
          {stats.total} products across racks, short barbells, and benches.
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
