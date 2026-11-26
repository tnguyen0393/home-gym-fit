import Link from "next/link";
import {
  ceilingUsesUprightHeight,
  formatBool,
  formatFoldedDepth,
  formatInches,
  RACK_TYPE_LABELS,
} from "@/lib/format";
import type { GymProduct } from "@/lib/types";
import { ProductLinks } from "@/components/ProductLinks";
import { SpecValue } from "@/components/SpecTable";

export function ProductCard({ product }: { product: GymProduct }) {
  const rackType = product.rack_specs?.rack_type;
  const barLength = product.barbell_specs?.overall_length_in;

  return (
    <article className="flex flex-col gap-3 border border-stone-300 bg-white p-4">
      <header>
        <p className="text-sm text-stone-600">{product.brand}</p>
        <h2 className="text-lg font-semibold leading-snug">
          <Link href={`/products/${product.slug}/`} className="underline decoration-stone-300">
            {product.model}
          </Link>
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          {rackType ? RACK_TYPE_LABELS[rackType] : product.category}
          {" · "}
          Last verified {product.verification.last_verified_date}
          {" · "}
          {product.verification.verification_status}
        </p>
      </header>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
        {product.category === "barbell" ? (
          <>
            <dt className="text-stone-600">Overall length</dt>
            <dd className="tabular-nums">
              <SpecValue value={formatInches(barLength)} />
            </dd>
            <dt className="text-stone-600">Shaft length</dt>
            <dd className="tabular-nums">
              <SpecValue value={formatInches(product.barbell_specs?.shaft_length_in)} />
            </dd>
            <dt className="text-stone-600">Rackable</dt>
            <dd>
              <SpecValue value={formatBool(product.barbell_specs?.rackable)} />
            </dd>
          </>
        ) : product.dimensions ? (
          <>
            <dt className="text-stone-600">Upright height</dt>
            <dd className="tabular-nums">
              <SpecValue value={formatInches(product.dimensions.height_in)} />
            </dd>
            <dt className="text-stone-600">Minimum ceiling</dt>
            <dd className="tabular-nums">
              <SpecValue value={formatInches(product.dimensions.min_ceiling_in)} />
            </dd>
            <dt className="text-stone-600">Open depth</dt>
            <dd className="tabular-nums">
              <SpecValue value={formatInches(product.dimensions.depth_open_in)} />
            </dd>
            <dt className="text-stone-600">Folded depth</dt>
            <dd className="tabular-nums">
              <SpecValue value={formatFoldedDepth(product)} />
            </dd>
          </>
        ) : null}
      </dl>
      {ceilingUsesUprightHeight(product) ? (
        <p className="text-sm text-amber-800">
          Minimum ceiling is unverified. Only upright height is published.
        </p>
      ) : null}
      {product.category === "barbell" && barLength == null ? (
        <p className="text-sm text-amber-800">Overall length is unverified.</p>
      ) : null}
      <ProductLinks product={product} />
    </article>
  );
}
