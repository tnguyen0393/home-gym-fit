import Link from "next/link";
import { cardSpecCells, CATEGORY_LABELS, formatDisplayDate, RACK_TYPE_LABELS } from "@/lib/format";
import type { GymProduct } from "@/lib/types";
import { ProductLinks } from "@/components/ProductLinks";
import { SpecValue } from "@/components/SpecTable";

export function ProductCard({
  product,
  headingLevel = 2,
  compare,
}: {
  product: GymProduct;
  headingLevel?: 2 | 3;
  compare?: {
    checked: boolean;
    disabled: boolean;
    onChange: () => void;
  };
}) {
  const rackType = product.rack_specs?.rack_type;
  const kind = rackType ? RACK_TYPE_LABELS[rackType] : CATEGORY_LABELS[product.category];
  const Title = headingLevel === 3 ? "h3" : "h2";

  return (
    <article className="flex h-full flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <header className="flex flex-col gap-1">
        {compare ? (
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              className="size-4 accent-indigo-800"
              checked={compare.checked}
              disabled={compare.disabled}
              onChange={compare.onChange}
              aria-label={`Compare ${product.brand} ${product.model}`}
            />
            Compare
          </label>
        ) : null}
        <p className="text-sm text-stone-600">{product.brand}</p>
        <Link
          href={`/products/${product.slug}/`}
          className="group block text-stone-950 hover:text-indigo-800"
        >
          <Title className="text-lg font-semibold leading-snug underline decoration-transparent underline-offset-4 group-hover:decoration-indigo-800">
            {product.model}
          </Title>
          <span aria-hidden="true" className="mt-1 inline-block text-sm font-medium text-indigo-800">
            Specs →
          </span>
        </Link>
        <p className="text-sm text-stone-600">
          {kind}
          {" · "}
          Last verified {formatDisplayDate(product.verification.last_verified_date)}
        </p>
      </header>
      <dl className="grid grid-cols-4 gap-2 border-t border-stone-100 pt-3">
        {cardSpecCells(product).map((cell) => (
          <div key={cell.label} className="min-w-0">
            <dt className="text-xs leading-4 text-stone-500">{cell.label}</dt>
            <dd className="mt-1">
              <SpecValue value={cell.value} hint={cell.hint} badge />
            </dd>
          </div>
        ))}
      </dl>
      {(product.category === "bench" || product.category === "dumbbell") &&
      product.verification.unverified_fields.length > 0 ? (
        <p>
          <span
            className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-950"
            title="The manufacturer has not published every spec."
          >
            Unverified
            <span aria-hidden="true">?</span>
            <span className="sr-only">. The manufacturer has not published every spec.</span>
          </span>
        </p>
      ) : null}
      <ProductLinks product={product} />
    </article>
  );
}
