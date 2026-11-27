import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DisclosureNote } from "@/components/DisclosureNote";
import { FitDiagram } from "@/components/FitDiagram";
import { JsonLd } from "@/components/JsonLd";
import { OutboundLink } from "@/components/OutboundLink";
import { ProductLinks } from "@/components/ProductLinks";
import { SpecTable } from "@/components/SpecTable";
import { textLinkClass } from "@/components/styles";
import { amazonLink } from "@/lib/affiliates";
import {
  ceilingUsesUprightHeight,
  formatDisplayDate,
  humanizeFieldPath,
  dumbbellSpecRows,
  productSummary,
  shopperNotes,
  specRows,
} from "@/lib/format";
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
  const dumbbellRows = product.category === "dumbbell" ? dumbbellSpecRows(product) : [];
  const notes = shopperNotes(product.verification.notes).trim();

  return (
    <article className="flex flex-col gap-6">
      <JsonLd data={productJsonLd(product)} />
      <DisclosureNote includeAmazonStatement={amazonLink(product) != null} />
      <header className="flex max-w-prose flex-col gap-2">
        <p className="text-sm font-medium text-indigo-800">{product.brand}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{product.model}</h1>
        <p className="text-sm text-stone-600">
          Last verified {formatDisplayDate(product.verification.last_verified_date)}
        </p>
      </header>
      <ProductLinks product={product} />
      <FitDiagram product={product} />
      {dumbbellRows.length > 0 ? (
        <section className="max-w-3xl rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="mb-3 text-xl font-semibold">Dumbbell specs</h2>
          <SpecTable rows={dumbbellRows} />
        </section>
      ) : null}
      <div className="max-w-3xl rounded-lg border border-stone-200 bg-white p-4">
        <SpecTable rows={rows} />
      </div>
      {product.category === "rack" && ceilingUsesUprightHeight(product) ? (
        <p className="max-w-prose text-sm text-stone-600">
          Minimum ceiling is unverified. Upright height is used for ceiling filters, and it is not
          a clearance calculation.
        </p>
      ) : null}
      <section className="flex max-w-prose flex-col gap-2">
        <h2 className="text-xl font-semibold">Unverified fields</h2>
        {product.verification.unverified_fields.length === 0 ? (
          <p className="text-sm">None listed.</p>
        ) : (
          <ul className="list-disc pl-5 text-sm">
            {product.verification.unverified_fields.map((field) => (
              <li key={field}>{humanizeFieldPath(field, product.category)}</li>
            ))}
          </ul>
        )}
      </section>
      {notes.length > 0 ? (
        <section className="flex max-w-prose flex-col gap-2">
          <h2 className="text-xl font-semibold">Verification notes</h2>
          <p className="text-sm leading-6 whitespace-pre-wrap">{notes}</p>
        </section>
      ) : null}
      {product.verification.additional_source_urls.length > 0 ? (
        <section className="flex max-w-prose flex-col gap-2">
          <h2 className="text-xl font-semibold">Additional sources</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {product.verification.additional_source_urls.map((url) => (
              <li key={url}>
                <OutboundLink href={url} affiliate={false} className={textLinkClass}>
                  {url}
                </OutboundLink>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
