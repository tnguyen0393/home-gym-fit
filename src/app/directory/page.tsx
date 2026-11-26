import type { Metadata } from "next";
import { DirectoryExplorer } from "@/components/DirectoryExplorer";
import { DisclosureNote } from "@/components/DisclosureNote";
import { JsonLd } from "@/components/JsonLd";
import { amazonLink } from "@/lib/affiliates";
import { itemListJsonLd } from "@/lib/jsonld";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Directory",
  description:
    "Filter compact racks and short rackable barbells by ceiling, folded depth, wall mount, rack type, and bar length.",
  alternates: { canonical: "/directory/" },
};

export default function DirectoryPage() {
  const products = getProducts();
  const showAmazon = products.some((product) => amazonLink(product) != null);

  return (
    <div className="flex flex-col gap-5">
      <JsonLd data={itemListJsonLd("Home Gym Fit directory", products)} />
      <header className="flex max-w-prose flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Directory</h1>
        <p className="text-stone-700">
          Published measurements only. A missing minimum ceiling is not estimated.
        </p>
      </header>
      <DisclosureNote includeAmazonStatement={showAmazon} />
      <DirectoryExplorer products={products} />
    </div>
  );
}
