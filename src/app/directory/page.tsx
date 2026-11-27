import { DirectoryExplorer } from "@/components/DirectoryExplorer";
import { DisclosureNote } from "@/components/DisclosureNote";
import { JsonLd } from "@/components/JsonLd";
import { amazonLink } from "@/lib/affiliates";
import { itemListJsonLd } from "@/lib/jsonld";
import { getProducts } from "@/lib/products";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Directory",
  "Filter compact racks, short rackable barbells, vertical-storage benches, and adjustable dumbbells by ceiling, folded depth, wall mount, rack type, bar length, tray, and storage.",
  "/directory/",
);

export default function DirectoryPage() {
  const products = getProducts();
  const showAmazon = products.some((product) => amazonLink(product)?.affiliate === true);

  return (
    <div className="flex flex-col gap-5">
      <JsonLd data={itemListJsonLd("Home Gym Fit directory", products)} />
      <header className="flex max-w-prose flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Directory</h1>
        <p className="text-stone-700">
          Published measurements for racks, short barbells, vertical-storage benches, and adjustable
          dumbbells. A missing number stays unverified.
        </p>
      </header>
      <DisclosureNote includeAmazonStatement={showAmazon} />
      <DirectoryExplorer products={products} />
    </div>
  );
}
