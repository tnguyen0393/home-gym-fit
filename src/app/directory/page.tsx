import type { Metadata } from "next";
import { DirectoryExplorer } from "@/components/DirectoryExplorer";
import { JsonLd } from "@/components/JsonLd";
import { itemListJsonLd } from "@/lib/jsonld";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Directory",
  description:
    "Filter manufacturer-verified compact racks and short rackable barbells by ceiling, folded depth, wall mount, rack type, category, and bar length.",
  alternates: { canonical: "/directory/" },
};

export default function DirectoryPage() {
  const products = getProducts();

  return (
    <div className="flex flex-col gap-6">
      <JsonLd data={itemListJsonLd("Home Gym Fit directory", products)} />
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Directory</h1>
        <p className="max-w-3xl text-stone-700">
          Filters use published fields only. A null minimum ceiling is not estimated. Renter-friendly
          means wall_mount_required is false.
        </p>
      </header>
      <DirectoryExplorer products={products} />
    </div>
  );
}
