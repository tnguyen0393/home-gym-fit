"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { matchesDirectoryFilters } from "@/lib/filters";
import { RACK_TYPE_LABELS } from "@/lib/format";
import type { GymProduct, ProductCategory, RackType } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { ProductCompare } from "@/components/ProductCompare";
import { chipClass, fieldClass, secondaryButtonClass } from "@/components/styles";

const RACK_TYPES = Object.keys(RACK_TYPE_LABELS) as RackType[];
const CATEGORIES: ProductCategory[] = ["rack", "barbell", "bench"];
const CATEGORY_FILTER_LABELS: Record<ProductCategory, string> = {
  rack: "Racks",
  barbell: "Barbells",
  bench: "Benches",
};
const RACK_TYPE_SET = new Set<string>(RACK_TYPES);
const CATEGORY_SET = new Set<string>(CATEGORIES);

type ParsedInches = number | null | "invalid";
type SortKey = "catalog" | "height" | "folded" | "brand";

function parseInches(value: string): ParsedInches {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) return "invalid";
  return parsed;
}

function readInchesParam(value: string | null): string {
  if (!value) return "";
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 10000) return "";
  return String(parsed);
}

function readSort(value: string | null): SortKey {
  if (value === "height" || value === "folded" || value === "brand") return value;
  return "catalog";
}

function readInitialQuery(products: GymProduct[]): {
  ceiling: string;
  foldedDepth: string;
  barLength: string;
  category: "any" | ProductCategory;
  rackType: "any" | RackType;
  renterOnly: boolean;
  foldingOnly: boolean;
  verticalStorage: boolean;
  sort: SortKey;
  compare: string[];
} {
  const params = new URLSearchParams(window.location.search);
  const categoryValue = params.get("category");
  const rackValue = params.get("rack");
  const compare = (params.get("compare") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id, index, all) => {
      return id.length > 0 && all.indexOf(id) === index && products.some((product) => product.id === id);
    })
    .slice(0, 3);

  return {
    ceiling: readInchesParam(params.get("ceiling")),
    foldedDepth: readInchesParam(params.get("depth")),
    barLength: readInchesParam(params.get("length")),
    category:
      categoryValue && CATEGORY_SET.has(categoryValue) ? (categoryValue as ProductCategory) : "any",
    rackType: rackValue && RACK_TYPE_SET.has(rackValue) ? (rackValue as RackType) : "any",
    renterOnly: params.get("renter") === "1",
    foldingOnly: params.get("folding") === "1",
    verticalStorage: params.get("vertical") === "1",
    sort: readSort(params.get("sort")),
    compare,
  };
}

function sortProducts(products: GymProduct[], sort: SortKey): GymProduct[] {
  if (sort === "catalog") return products;
  return products
    .map((product, index) => ({ product, index }))
    .sort((a, b) => {
      if (sort === "brand") {
        const brand = a.product.brand.localeCompare(b.product.brand);
        if (brand !== 0) return brand;
        const model = a.product.model.localeCompare(b.product.model);
        return model !== 0 ? model : a.index - b.index;
      }
      const left =
        sort === "height" ? a.product.dimensions?.height_in : a.product.dimensions?.depth_folded_in;
      const right =
        sort === "height" ? b.product.dimensions?.height_in : b.product.dimensions?.depth_folded_in;
      if (left == null && right == null) return a.index - b.index;
      if (left == null) return 1;
      if (right == null) return -1;
      return left - right || a.index - b.index;
    })
    .map((entry) => entry.product);
}

export function DirectoryExplorer({ products }: { products: GymProduct[] }) {
  const productsRef = useRef(products);
  const [category, setCategory] = useState<"any" | ProductCategory>("any");
  const [rackType, setRackType] = useState<"any" | RackType>("any");
  const [renterOnly, setRenterOnly] = useState(false);
  const [foldingOnly, setFoldingOnly] = useState(false);
  const [verticalStorage, setVerticalStorage] = useState(false);
  const [ceiling, setCeiling] = useState("");
  const [foldedDepth, setFoldedDepth] = useState("");
  const [barLength, setBarLength] = useState("");
  const [sort, setSort] = useState<SortKey>("catalog");
  const [selected, setSelected] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const initial = readInitialQuery(productsRef.current);
    setCeiling(initial.ceiling);
    setFoldedDepth(initial.foldedDepth);
    setBarLength(initial.barLength);
    setCategory(initial.category);
    setRackType(initial.rackType);
    setRenterOnly(initial.renterOnly);
    setFoldingOnly(initial.foldingOnly);
    setVerticalStorage(initial.verticalStorage);
    setSort(initial.sort);
    setSelected(initial.compare);
    setShowCompare(initial.compare.length >= 2);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams();
    if (ceiling.trim()) params.set("ceiling", ceiling.trim());
    if (foldedDepth.trim()) params.set("depth", foldedDepth.trim());
    if (barLength.trim()) params.set("length", barLength.trim());
    if (category !== "any") params.set("category", category);
    if (rackType !== "any") params.set("rack", rackType);
    if (renterOnly) params.set("renter", "1");
    if (foldingOnly) params.set("folding", "1");
    if (verticalStorage) params.set("vertical", "1");
    if (sort !== "catalog") params.set("sort", sort);
    if (selected.length > 0) params.set("compare", selected.join(","));
    const query = params.toString();
    const path = window.location.pathname;
    const next = query ? `${path}?${query}` : path;
    if (`${path}${window.location.search}` !== next) {
      window.history.replaceState(null, "", next);
    }
  }, [
    hydrated,
    ceiling,
    foldedDepth,
    barLength,
    category,
    rackType,
    renterOnly,
    foldingOnly,
    verticalStorage,
    sort,
    selected,
  ]);

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
    const matched = products.filter((product) =>
      matchesDirectoryFilters(product, {
        category,
        rackType,
        renterOnly,
        foldingOnly,
        verticalStorage,
        maxCeilingIn,
        maxFoldedDepthIn,
        maxBarLengthIn,
      }),
    );
    return sortProducts(matched, sort);
  }, [
    products,
    category,
    rackType,
    renterOnly,
    foldingOnly,
    verticalStorage,
    maxCeilingIn,
    maxFoldedDepthIn,
    maxBarLengthIn,
    sort,
  ]);

  const selectedProducts = selected.flatMap((id) => {
    const product = products.find((item) => item.id === id);
    return product ? [product] : [];
  });

  const activeCount =
    (category !== "any" ? 1 : 0) +
    (rackType !== "any" ? 1 : 0) +
    (renterOnly ? 1 : 0) +
    (foldingOnly ? 1 : 0) +
    (verticalStorage ? 1 : 0) +
    (ceiling.trim() ? 1 : 0) +
    (foldedDepth.trim() ? 1 : 0) +
    (barLength.trim() ? 1 : 0);

  function toggleSelected(id: string) {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  }

  function resetFilters() {
    setCategory("any");
    setRackType("any");
    setRenterOnly(false);
    setFoldingOnly(false);
    setVerticalStorage(false);
    setCeiling("");
    setFoldedDepth("");
    setBarLength("");
  }

  const chips = [
    {
      label: '≤ 96" ceiling',
      pressed: ceiling.trim() === "96",
      onClick: () => setCeiling((value) => (value.trim() === "96" ? "" : "96")),
    },
    {
      label: '≤ 84" ceiling',
      pressed: ceiling.trim() === "84",
      onClick: () => setCeiling((value) => (value.trim() === "84" ? "" : "84")),
    },
    {
      label: "No wall mount",
      pressed: renterOnly,
      onClick: () => setRenterOnly((value) => !value),
    },
    {
      label: "Folding",
      pressed: foldingOnly,
      onClick: () => setFoldingOnly((value) => !value),
    },
    {
      label: "Vertical storage",
      pressed: verticalStorage,
      onClick: () => setVerticalStorage((value) => !value),
    },
  ];

  return (
    <div className={`flex flex-col gap-4 ${selected.length > 0 ? "pb-24" : ""}`}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="rounded-lg border border-stone-200 bg-white">
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left font-medium md:hidden"
            aria-expanded={filtersOpen}
            aria-controls="directory-filter-panel"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <span>
              Filters
              {activeCount > 0 ? (
                <span className="ml-2 rounded-full bg-indigo-800 px-2 py-0.5 text-xs font-semibold text-white">
                  {activeCount}
                </span>
              ) : null}
            </span>
            <span aria-hidden="true" className={filtersOpen ? "rotate-180 text-stone-500" : "text-stone-500"}>
              ▾
            </span>
          </button>
          <div
            id="directory-filter-panel"
            className={`${filtersOpen ? "flex" : "hidden"} flex-col gap-4 border-t border-stone-200 p-4 md:flex md:border-t-0`}
          >
            <div className="flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  aria-pressed={chip.pressed}
                  className={chipClass(chip.pressed)}
                  onClick={chip.onClick}
                >
                  {chip.label}
                </button>
              ))}
              <button type="button" className={`${secondaryButtonClass} md:ml-auto`} onClick={resetFilters}>
                Reset filters
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="flex flex-col gap-1 text-sm">
                Max ceiling height (in)
                <input
                  value={ceiling}
                  onChange={(event) => setCeiling(event.target.value)}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  placeholder="e.g. 96"
                  autoComplete="off"
                  aria-invalid={maxCeilingIn === "invalid"}
                  className={fieldClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Max folded depth (in)
                <input
                  value={foldedDepth}
                  onChange={(event) => setFoldedDepth(event.target.value)}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  placeholder="e.g. 6"
                  autoComplete="off"
                  aria-invalid={maxFoldedDepthIn === "invalid"}
                  className={fieldClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Max bar length (in)
                <input
                  value={barLength}
                  onChange={(event) => setBarLength(event.target.value)}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  placeholder="e.g. 72"
                  autoComplete="off"
                  aria-invalid={maxBarLengthIn === "invalid"}
                  className={fieldClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Category
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as "any" | ProductCategory)}
                  className={fieldClass}
                >
                  <option value="any">All</option>
                  {CATEGORIES.map((value) => (
                    <option key={value} value={value}>
                      {CATEGORY_FILTER_LABELS[value]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Rack type
                <select
                  value={rackType}
                  onChange={(event) => setRackType(event.target.value as "any" | RackType)}
                  className={fieldClass}
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
                    className="size-4 accent-indigo-800"
                    checked={foldingOnly}
                    onChange={(event) => setFoldingOnly(event.target.checked)}
                  />
                  Folding only
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-4 accent-indigo-800"
                    checked={renterOnly}
                    onChange={(event) => setRenterOnly(event.target.checked)}
                  />
                  Renter-friendly (no wall mount)
                </label>
              </div>
            </div>
            <details className="text-sm text-stone-700">
              <summary className="cursor-pointer font-medium text-indigo-800">How filters work</summary>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Category and rack type keep products of that kind. Barbells and benches have no
                  rack type, so choosing a rack type hides them.
                </li>
                <li>
                  Vertical storage keeps benches the manufacturer says store upright. Racks and
                  barbells stay out.
                </li>
                <li>
                  Renter-friendly keeps products the manufacturer says do not need a wall mount. A
                  missing answer does not count as renter-friendly.
                </li>
                <li>
                  Folding keeps products that fold in, out, or up, folding wall racks, and racks
                  with a published folded depth. A product the manufacturer says does not fold stays
                  out.
                </li>
                <li>
                  Max ceiling height applies to racks. It uses the published minimum ceiling when
                  one exists. Otherwise it uses upright height, and the card marks minimum ceiling
                  as unverified. A rack with neither number is omitted. Barbells and benches stay
                  in the list. Bench pad height is not a ceiling measurement.
                </li>
                <li>
                  Max folded depth applies to racks and benches. Only a published folded depth at or
                  under the number stays. An unpublished folded depth does not pass. Barbells stay
                  in the list.
                </li>
                <li>
                  Max bar length applies to barbells and uses published overall length. A bar with
                  no published length is omitted. Racks and benches stay in the list.
                </li>
              </ul>
            </details>
          </div>
        </div>
      </form>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-stone-700">
          {invalid
            ? "Enter ceiling, folded depth, and bar length as positive numbers of inches, or leave them blank."
            : `Showing ${visible.length} of ${products.length}.`}
        </p>
        <label className="flex items-center gap-2 text-sm">
          Sort
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            aria-label="Sort"
            className={fieldClass}
          >
            <option value="catalog">Catalog order</option>
            <option value="height">Shortest height</option>
            <option value="folded">Thinnest folded</option>
            <option value="brand">Brand</option>
          </select>
        </label>
      </div>
      {showCompare && selectedProducts.length >= 2 ? <ProductCompare products={selectedProducts} /> : null}
      {visible.length === 0 && !invalid ? (
        <p className="text-sm text-stone-700">No products match these filters.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visible.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              compare={{
                checked: selected.includes(product.id),
                disabled: !selected.includes(product.id) && selected.length >= 3,
                onChange: () => toggleSelected(product.id),
              }}
            />
          ))}
        </div>
      )}
      {selected.length > 0 ? (
        <div className="sticky bottom-4 z-20 flex flex-wrap items-center gap-3 rounded-lg border border-indigo-200 bg-white px-4 py-3 shadow-lg">
          <p className="text-sm font-medium" aria-live="polite">
            {selected.length} of 3 selected
          </p>
          <button
            type="button"
            className={`${secondaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
            disabled={selected.length < 2}
            onClick={() => {
              setShowCompare(true);
              requestAnimationFrame(() => {
                document.getElementById("compare-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
              });
            }}
          >
            Compare
          </button>
          <button
            type="button"
            className="text-sm font-medium text-indigo-800 hover:underline"
            onClick={() => {
              setSelected([]);
              setShowCompare(false);
            }}
          >
            Clear
          </button>
        </div>
      ) : null}
    </div>
  );
}
