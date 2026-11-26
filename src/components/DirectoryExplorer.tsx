"use client";

import { useMemo, useState } from "react";
import { matchesDirectoryFilters } from "@/lib/filters";
import { RACK_TYPE_LABELS } from "@/lib/format";
import type { GymProduct, ProductCategory, RackType } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

const RACK_TYPES = Object.keys(RACK_TYPE_LABELS) as RackType[];
const CATEGORIES: ProductCategory[] = ["rack", "barbell", "bench"];

type ParsedInches = number | null | "invalid";

function parseInches(value: string): ParsedInches {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) return "invalid";
  return parsed;
}

export function DirectoryExplorer({ products }: { products: GymProduct[] }) {
  const [category, setCategory] = useState<"any" | ProductCategory>("any");
  const [rackType, setRackType] = useState<"any" | RackType>("any");
  const [renterOnly, setRenterOnly] = useState(false);
  const [foldingOnly, setFoldingOnly] = useState(false);
  const [ceiling, setCeiling] = useState("");
  const [foldedDepth, setFoldedDepth] = useState("");
  const [barLength, setBarLength] = useState("");

  const barbellCount = products.filter((product) => product.category === "barbell").length;
  const maxCeilingIn = parseInches(ceiling);
  const maxFoldedDepthIn = parseInches(foldedDepth);
  const maxBarLengthIn = parseInches(barLength);
  const invalid =
    maxCeilingIn === "invalid" || maxFoldedDepthIn === "invalid" || maxBarLengthIn === "invalid";

  const visible = useMemo(() => {
    if (
      maxCeilingIn === "invalid" ||
      maxFoldedDepthIn === "invalid" ||
      maxBarLengthIn === "invalid"
    ) {
      return [];
    }
    return products.filter((product) =>
      matchesDirectoryFilters(product, {
        category,
        rackType,
        renterOnly,
        foldingOnly,
        maxCeilingIn,
        maxFoldedDepthIn,
        maxBarLengthIn,
      }),
    );
  }, [
    products,
    category,
    rackType,
    renterOnly,
    foldingOnly,
    maxCeilingIn,
    maxFoldedDepthIn,
    maxBarLengthIn,
  ]);

  return (
    <div className="flex flex-col gap-6">
      <form className="grid gap-4 border border-stone-300 bg-white p-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Max ceiling height (in)
          <input
            value={ceiling}
            onChange={(event) => setCeiling(event.target.value)}
            inputMode="decimal"
            className="border border-stone-400 px-2 py-1"
          />
          <span className="text-stone-600">
            Compared with min_ceiling_in when published. Otherwise upright height_in is used, and
            the card says the minimum ceiling is unverified.
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Max folded depth (in)
          <input
            value={foldedDepth}
            onChange={(event) => setFoldedDepth(event.target.value)}
            inputMode="decimal"
            className="border border-stone-400 px-2 py-1"
          />
          <span className="text-stone-600">
            Keeps products whose published depth_folded_in is at or under this number. Unpublished
            folded depth does not pass.
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Max bar length (in)
          <input
            value={barLength}
            onChange={(event) => setBarLength(event.target.value)}
            inputMode="decimal"
            className="border border-stone-400 px-2 py-1"
          />
          <span className="text-stone-600">
            Applies to barbells using overall_length_in. Racks stay in the list. A bar with no
            published length is omitted.
            {barbellCount === 0 ? " No barbells are in the catalog yet." : null}
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as "any" | ProductCategory)}
            className="border border-stone-400 px-2 py-1"
          >
            <option value="any">All</option>
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Rack type
          <select
            value={rackType}
            onChange={(event) => setRackType(event.target.value as "any" | RackType)}
            className="border border-stone-400 px-2 py-1"
          >
            <option value="any">All</option>
            {RACK_TYPES.map((value) => (
              <option key={value} value={value}>
                {RACK_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col justify-end gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={foldingOnly}
              onChange={(event) => setFoldingOnly(event.target.checked)}
            />
            Folding only
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={renterOnly}
              onChange={(event) => setRenterOnly(event.target.checked)}
            />
            Renter-friendly only (wall_mount_required is false)
          </label>
        </div>
      </form>
      <p aria-live="polite" className="text-sm text-stone-700">
        {invalid
          ? "Enter ceiling, folded depth, and bar length as positive numbers of inches, or leave them blank."
          : `Showing ${visible.length} of ${products.length}.`}
      </p>
      {visible.length === 0 && !invalid ? (
        <p className="text-sm text-stone-700">No products match these filters.</p>
      ) : (
        <div className="grid gap-4">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
