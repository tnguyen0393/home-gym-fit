import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ProductLinks } from "@/components/ProductLinks";
import { SpecTable } from "@/components/SpecTable";
import { OutboundLink } from "@/components/OutboundLink";
import { productSummary, specRows } from "@/lib/format";
import { productJsonLd } from "@/lib/jsonld";
import { getProductBySlug, getProducts } from "@/lib/products";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.brand} ${product.model}`,
    description: productSummary(product),
    alternates: { canonical: `/products/${product.slug}/` },
  };
}

export default async function ProductPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const rows = specRows(product);

  return (
    <article className="flex flex-col gap-6">
      <JsonLd data={productJsonLd(product)} />
      <header className="flex flex-col gap-2">
        <p className="text-sm text-stone-600">{product.brand}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{product.model}</h1>
        <p className="text-sm text-stone-600">
          Verification status: {product.verification.verification_status}. Last verified{" "}
          {product.verification.last_verified_date}.
        </p>
      </header>
      <ProductLinks product={product} />
      <SpecTable rows={rows} />
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Unverified fields</h2>
        {product.verification.unverified_fields.length === 0 ? (
          <p className="text-sm">None listed.</p>
        ) : (
          <ul className="list-disc pl-5 text-sm">
            {product.verification.unverified_fields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        )}
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Verification notes</h2>
        <p className="whitespace-pre-wrap text-sm leading-6">{product.verification.notes}</p>
      </section>
      {product.verification.additional_source_urls.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Additional sources</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {product.verification.additional_source_urls.map((url) => (
              <li key={url}>
                <OutboundLink href={url} affiliate={false}>
                  <span className="underline">{url}</span>
                </OutboundLink>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
