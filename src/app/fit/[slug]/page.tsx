import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { JsonLd } from "@/components/JsonLd";
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
    description: preset.criteria,
    alternates: { canonical: `/fit/${preset.slug}/` },
  };
}

export default async function FitPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const preset = getFitPreset(slug);
  if (!preset) notFound();
  const products = getProducts().filter(preset.matches);

  return (
    <div className="flex flex-col gap-6">
      <JsonLd data={itemListJsonLd(preset.title, products)} />
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{preset.title}</h1>
        <p className="max-w-3xl text-stone-700">{preset.criteria}</p>
      </header>
      {products.length === 0 ? (
        <p>No products in the current catalog match this rule.</p>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
