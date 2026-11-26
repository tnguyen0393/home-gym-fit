import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DisclosureNote } from "@/components/DisclosureNote";
import { JsonLd } from "@/components/JsonLd";
import { ProductCard } from "@/components/ProductCard";
import { textLinkClass } from "@/components/styles";
import { amazonLink } from "@/lib/affiliates";
import { fitPresets, getFitPreset } from "@/lib/fit";
import { itemListJsonLd } from "@/lib/jsonld";
import { getProducts } from "@/lib/products";

export const dynamicParams = false;

export function generateStaticParams() {
  return fitPresets.map((preset) => ({ slug: preset.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const preset = getFitPreset(slug);
  if (!preset) return {};
  return {
    title: preset.title,
    description: preset.summary,
    alternates: { canonical: `/fit/${preset.slug}/` },
  };
}

export default async function FitPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const preset = getFitPreset(slug);
  if (!preset) notFound();
  const products = getProducts().filter(preset.matches);
  const showAmazon = products.some((product) => amazonLink(product) != null);
  const countLabel =
    products.length === 1 ? "1 product matches this rule." : `${products.length} products match this rule.`;

  return (
    <div className="flex flex-col gap-6">
      <JsonLd data={itemListJsonLd(preset.title, products)} />
      <DisclosureNote includeAmazonStatement={showAmazon} />
      <header className="flex max-w-prose flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{preset.title}</h1>
        <p className="text-stone-700">{preset.criteria}</p>
        <p className="text-sm text-stone-600">{countLabel}</p>
      </header>
      {products.length === 0 ? null : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      <p>
        <Link href="/directory/" className={textLinkClass}>
          Browse the full directory →
        </Link>
      </p>
    </div>
  );
}
