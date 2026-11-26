import type { Metadata } from "next";
import Link from "next/link";
import { fitPresets } from "@/lib/fit";
import { CATEGORY_LABELS, RACK_TYPE_LABELS } from "@/lib/format";
import { catalogStats, getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Home Gym Fit",
  description:
    "Manufacturer-verified dimensions for compact and folding racks and short rackable barbells.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const products = getProducts();
  const stats = catalogStats(products);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Compact home-gym fit directory</h1>
        <p className="max-w-3xl text-lg text-stone-700">
          Manufacturer-verified dimensions for apartment and low-ceiling racks, plus short rackable
          barbells when Spec Steward publishes them. Missing numbers stay unverified.
        </p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Products" value={String(stats.total)} />
        <Stat label="Brands" value={String(stats.brands)} />
        <Stat label="No wall mount" value={String(stats.noWallMount)} />
        <Stat label="Stated minimum ceiling" value={String(stats.statedMinCeiling)} />
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Catalog</h2>
        <ul className="grid gap-1 text-sm sm:grid-cols-2">
          {(Object.keys(CATEGORY_LABELS) as (keyof typeof CATEGORY_LABELS)[]).map((category) => (
            <li key={category}>
              {CATEGORY_LABELS[category]}: {stats.byCategory[category]}
            </li>
          ))}
          {(Object.keys(RACK_TYPE_LABELS) as (keyof typeof RACK_TYPE_LABELS)[]).map((rackType) => (
            <li key={rackType}>
              {RACK_TYPE_LABELS[rackType]}: {stats.byRackType[rackType]}
            </li>
          ))}
        </ul>
        {stats.latestVerified ? (
          <p className="text-sm text-stone-600">Latest verification date: {stats.latestVerified}.</p>
        ) : null}
        <p>
          <Link href="/directory/" className="underline">
            Open the directory
          </Link>
        </p>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Fit presets</h2>
        <ul className="grid gap-3">
          {fitPresets.map((preset) => (
            <li key={preset.slug} className="border border-stone-300 bg-white p-4">
              <h3 className="font-semibold">
                <Link href={`/fit/${preset.slug}/`} className="underline decoration-stone-300">
                  {preset.title}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-stone-700">{preset.criteria}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-stone-300 bg-white p-4">
      <p className="text-sm text-stone-600">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
