import type { ArticleType, GymProduct, ProductCategory, RackType } from "@/lib/types";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  rack: "Rack",
  bench: "Bench",
  barbell: "Barbell",
};

export const RACK_TYPE_LABELS: Record<RackType, string> = {
  "folding-wall": "Folding wall rack",
  "compact-power-rack": "Compact power rack",
  "half-rack": "Half rack",
  "squat-stand": "Squat stand",
};

export interface SpecRow {
  label: string;
  value: string;
  hint?: string;
}

export interface SpecCell {
  label: string;
  value: string;
  hint?: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const FIELD_LABELS: Record<string, string> = {
  sku: "SKU",
  "dimensions.min_ceiling_in": "Minimum ceiling",
  "dimensions.width_in": "Width",
  "dimensions.depth_open_in": "Open depth",
  "dimensions.depth_folded_in": "Folded depth",
  "dimensions.footprint_sqft": "Footprint",
  "dimensions.unit_weight_lbs": "Unit weight",
  "installation.wall_mount_required": "Wall mount required",
  "installation.floor_bolt_required": "Floor bolt required",
  "installation.stud_spacing_in": "Stud spacing",
  "installation.renter_friendly": "Renter-friendly",
  "installation.fold_direction": "Fold direction",
  "rack_specs.upright_size_in": "Upright size",
  "rack_specs.steel_gauge": "Steel gauge",
  "rack_specs.hole_size_in": "Hole size",
  "rack_specs.hole_spacing_in": "Hole spacing",
  "rack_specs.weight_capacity_lbs": "Weight capacity",
  "rack_specs.pullup_bar_included": "Pull-up bar included",
  "rack_specs.safeties_included": "Safeties included",
  "rack_specs.j_cups_included": "J-cups included",
  "barbell_specs.overall_length_in": "Overall length",
  "barbell_specs.shaft_length_in": "Shaft length",
  "barbell_specs.loadable_sleeve_length_in": "Loadable sleeve length",
  "barbell_specs.shaft_diameter_mm": "Shaft diameter",
  "barbell_specs.sleeve_diameter_in": "Sleeve diameter",
  "barbell_specs.tensile_strength_psi": "Tensile strength",
  "barbell_specs.weight_capacity_lbs": "Weight capacity",
  "barbell_specs.knurl_marks": "Knurl marks",
  "barbell_specs.center_knurl": "Center knurl",
  "barbell_specs.bushing_or_bearing": "Bushing or bearing",
  "barbell_specs.coating": "Coating",
  "barbell_specs.rackable": "Rackable",
};

const NOTE_REPLACEMENTS: [string, string][] = [
  ["dimensions.min_ceiling_in", "minimum ceiling"],
  ["dimensions.unit_weight_lbs", "unit weight"],
  ["dimensions.depth_folded_in", "folded depth"],
  ["dimensions.depth_open_in", "open depth"],
  ["dimensions.footprint_sqft", "footprint"],
  ["dimensions.height_in", "height"],
  ["dimensions.width_in", "width"],
  ["installation.floor_bolt_required", "floor bolt required"],
  ["installation.wall_mount_required", "wall mount required"],
  ["installation.stud_spacing_in", "stud spacing"],
  ["installation.renter_friendly", "renter-friendly"],
  ["installation.fold_direction", "fold direction"],
  ["rack_specs.weight_capacity_lbs", "weight capacity"],
  ["rack_specs.pullup_bar_included", "pull-up bar included"],
  ["rack_specs.safeties_included", "safeties included"],
  ["rack_specs.j_cups_included", "J-cups included"],
  ["rack_specs.hole_spacing_in", "hole spacing"],
  ["rack_specs.hole_size_in", "hole size"],
  ["barbell_specs.loadable_sleeve_length_in", "loadable sleeve length"],
  ["barbell_specs.weight_capacity_lbs", "weight capacity"],
  ["barbell_specs.sleeve_diameter_in", "sleeve diameter"],
  ["barbell_specs.shaft_length_in", "shaft length"],
  ["barbell_specs.overall_length_in", "overall length"],
  ["barbell_specs.center_knurl", "center knurl"],
  ["min_ceiling_in", "minimum ceiling"],
  ["unit_weight_lbs", "unit weight"],
  ["depth_folded_in", "folded depth"],
  ["depth_open_in", "open depth"],
  ["overall_length_in", "overall length"],
  ["loadable_sleeve_length_in", "loadable sleeve length"],
  ["sleeve_diameter_in", "sleeve diameter"],
  ["shaft_length_in", "shaft length"],
  ["wall_mount_required", "wall mount required"],
  ["floor_bolt_required", "floor bolt required"],
  ["stud_spacing_in", "stud spacing"],
  ["renter_friendly", "renter-friendly"],
  ["fold_direction", "fold direction"],
  ["unverified_fields", "unpublished fields"],
  ["rack_type", "rack type"],
];

export function formatNumber(value: number): string {
  return Object.is(value, -0) ? "0" : String(value);
}

export function formatDisplayDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const month = MONTHS[Number(match[2]) - 1];
  if (!month) return iso;
  return `${month} ${Number(match[3])}, ${match[1]}`;
}

export function humanizeTag(tag: string): string {
  return tag.replace(/([A-Za-z])-(?=[A-Za-z])/g, "$1 ");
}

export function humanizeFieldPath(path: string, category: ProductCategory): string {
  if (path === "dimensions.height_in") return category === "rack" ? "Upright height" : "Height";
  const known = FIELD_LABELS[path];
  if (known) return known;
  const leaf = path.split(".").pop() ?? path;
  return leaf
    .replaceAll("_", " ")
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

export function shopperNotes(notes: string): string {
  let text = notes;
  for (const [token, label] of NOTE_REPLACEMENTS) {
    text = text.replaceAll(token, label);
  }
  return text.replaceAll(" is null", " was not published");
}

export function articleTypeLabel(type: ArticleType): string {
  if (type === "compare") return "Comparison";
  if (type === "explainer") return "Explainer";
  return "Guide";
}

export function articleStatusLine(article: {
  publishedAt: string;
  updatedAt: string;
  lastVerifiedDate?: string;
  testingStatus?: string;
}): string {
  const verifiedOn = article.lastVerifiedDate ?? article.publishedAt;
  const parts = [`Verified ${formatDisplayDate(verifiedOn)}`];
  if (article.testingStatus === "manufacturer-verified") parts.push("Manufacturer specs");
  else if (article.testingStatus) parts.push(article.testingStatus.replaceAll("-", " "));
  if (article.updatedAt !== article.publishedAt) {
    parts.push(`Updated ${formatDisplayDate(article.updatedAt)}`);
  }
  return parts.join(" · ");
}

export function formatInches(value: number | null | undefined): string {
  if (value == null) return "Unverified";
  return `${formatNumber(value)} in`;
}

export function formatMillimeters(value: number | null | undefined): string {
  if (value == null) return "Unverified";
  return `${formatNumber(value)} mm`;
}

export function formatPounds(value: number | null | undefined): string {
  if (value == null) return "Unverified";
  return `${formatNumber(value)} lb`;
}

export function formatPsi(value: number | null | undefined): string {
  if (value == null) return "Unverified";
  return `${formatNumber(value)} psi`;
}

export function formatBool(value: boolean | null | undefined): string {
  if (value == null) return "Unverified";
  return value ? "Yes" : "No";
}

export function formatText(value: string | null | undefined): string {
  if (value == null || value.trim().length === 0) return "Unverified";
  return value;
}

export function ceilingUsesUprightHeight(product: GymProduct): boolean {
  return product.dimensions?.min_ceiling_in == null && product.dimensions?.height_in != null;
}

/** Value the directory ceiling filter compares. Not a clearance formula. */
export function ceilingReferenceIn(product: GymProduct): number | null {
  const stated = product.dimensions?.min_ceiling_in;
  if (stated != null) return stated;
  return product.dimensions?.height_in ?? null;
}

export function isFoldingProduct(product: GymProduct): boolean {
  const direction = product.installation?.fold_direction;
  if (direction === "inward" || direction === "outward" || direction === "upward") return true;
  if (direction === "none") return false;
  if (product.rack_specs?.rack_type === "folding-wall") return true;
  return product.dimensions?.depth_folded_in != null;
}

export function formatFoldDirection(product: GymProduct): string {
  if (product.installation == null) {
    return product.category === "rack" ? "Unverified" : "N/A";
  }
  const direction = product.installation.fold_direction;
  if (direction == null) return "Unverified";
  if (direction === "none") return "N/A";
  return direction.charAt(0).toUpperCase() + direction.slice(1);
}

export function formatFoldedDepth(product: GymProduct): string {
  const depth = product.dimensions?.depth_folded_in;
  if (depth != null) return formatInches(depth);
  if (product.installation?.fold_direction === "none") return "N/A";
  if (product.installation == null && product.category !== "rack") return "N/A";
  return "Unverified";
}

const CEILING_HINT =
  "Upright height is used when a minimum ceiling is not published. That height is not a clearance calculation.";

export function cardSpecCells(product: GymProduct): SpecCell[] {
  if (product.category === "barbell") {
    return [
      { label: "Length", value: formatInches(product.barbell_specs?.overall_length_in) },
      { label: "Shaft", value: formatInches(product.barbell_specs?.shaft_length_in) },
      {
        label: "Loadable sleeve",
        value: formatInches(product.barbell_specs?.loadable_sleeve_length_in),
      },
      { label: "Weight", value: formatPounds(product.dimensions?.unit_weight_lbs) },
    ];
  }

  if (product.category === "bench") {
    return [
      { label: "Height", value: formatInches(product.dimensions?.height_in) },
      { label: "Width", value: formatInches(product.dimensions?.width_in) },
      { label: "Depth", value: formatInches(product.dimensions?.depth_open_in) },
      { label: "Weight", value: formatPounds(product.dimensions?.unit_weight_lbs) },
    ];
  }

  return [
    { label: "Upright", value: formatInches(product.dimensions?.height_in) },
    {
      label: "Min ceiling",
      value: formatInches(product.dimensions?.min_ceiling_in),
      hint:
        product.dimensions?.min_ceiling_in != null
          ? undefined
          : ceilingUsesUprightHeight(product)
            ? CEILING_HINT
            : "The manufacturer has not published a minimum ceiling.",
    },
    { label: "Open depth", value: formatInches(product.dimensions?.depth_open_in) },
    { label: "Folded", value: formatFoldedDepth(product) },
  ];
}

export function formatStudSpacing(product: GymProduct): string {
  if (product.installation == null) {
    return product.category === "rack" ? "Unverified" : "N/A";
  }
  const spacing = product.installation.stud_spacing_in;
  if (spacing == null) return "Unverified";
  if (spacing.length === 0) return "N/A";
  return spacing.map((value) => `${formatNumber(value)} in`).join(", ");
}

export function formatSqft(value: number | null | undefined): string {
  if (value == null) return "Unverified";
  return `${formatNumber(value)} sq ft`;
}

/**
 * Rack nulls stay Unverified. A barbell null stays Unverified only when that path is
 * listed in unverified_fields. Other barbell nulls are N/A, not a missing rack measurement.
 */
function dimensionValue(
  product: GymProduct,
  key:
    | "height_in"
    | "min_ceiling_in"
    | "width_in"
    | "depth_open_in"
    | "depth_folded_in"
    | "footprint_sqft"
    | "unit_weight_lbs",
): string {
  const value = product.dimensions?.[key];
  if (key === "depth_folded_in") {
    if (value == null && product.installation?.fold_direction === "none") return "N/A";
  }
  if (typeof value === "number") {
    if (key === "footprint_sqft") return formatSqft(value);
    if (key === "unit_weight_lbs") return formatPounds(value);
    return formatInches(value);
  }
  if (product.verification.unverified_fields.includes(`dimensions.${key}`)) return "Unverified";
  if (product.category === "barbell") return "N/A";
  return "Unverified";
}

export function productSummary(product: GymProduct): string {
  const name = `${product.brand} ${product.model}`;
  const parts: string[] = [];
  if (product.category === "barbell") {
    const length = product.barbell_specs?.overall_length_in;
    if (length != null) parts.push(`overall length ${formatNumber(length)} in`);
    if (product.barbell_specs?.rackable === true) parts.push("rackable");
    if (product.barbell_specs?.rackable === false) parts.push("not rackable");
  } else {
    const height = product.dimensions?.height_in;
    const depth = product.dimensions?.depth_open_in;
    if (height != null) parts.push(`upright height ${formatNumber(height)} in`);
    if (depth != null) parts.push(`open depth ${formatNumber(depth)} in`);
  }
  if (parts.length === 0) return name;
  return `${name}. Published specs: ${parts.join("; ")}.`;
}

export function specRows(product: GymProduct): SpecRow[] {
  const rows: SpecRow[] = [
    { label: "Category", value: CATEGORY_LABELS[product.category] },
    { label: "SKU", value: formatText(product.sku) },
  ];

  if (product.rack_specs) {
    const specs = product.rack_specs;
    rows.push(
      { label: "Rack type", value: RACK_TYPE_LABELS[specs.rack_type] },
      { label: "Upright size", value: formatText(specs.upright_size_in) },
      {
        label: "Steel gauge",
        value: specs.steel_gauge == null ? "Unverified" : formatNumber(specs.steel_gauge),
      },
      { label: "Hole size", value: formatInches(specs.hole_size_in) },
      { label: "Hole spacing", value: formatText(specs.hole_spacing_in) },
      { label: "Weight capacity", value: formatPounds(specs.weight_capacity_lbs) },
      { label: "Pull-up bar included", value: formatBool(specs.pullup_bar_included) },
      { label: "Safeties included", value: formatBool(specs.safeties_included) },
      { label: "J-cups included", value: formatBool(specs.j_cups_included) },
    );
  }

  if (product.barbell_specs) {
    const specs = product.barbell_specs;
    rows.push(
      { label: "Overall length", value: formatInches(specs.overall_length_in) },
      { label: "Shaft length", value: formatInches(specs.shaft_length_in) },
      { label: "Loadable sleeve length", value: formatInches(specs.loadable_sleeve_length_in) },
      { label: "Shaft diameter", value: formatMillimeters(specs.shaft_diameter_mm) },
      { label: "Sleeve diameter", value: formatInches(specs.sleeve_diameter_in) },
      { label: "Tensile strength", value: formatPsi(specs.tensile_strength_psi) },
      { label: "Weight capacity", value: formatPounds(specs.weight_capacity_lbs) },
      { label: "Knurl marks", value: formatText(specs.knurl_marks) },
      { label: "Center knurl", value: formatBool(specs.center_knurl) },
      { label: "Bushing or bearing", value: formatText(specs.bushing_or_bearing) },
      { label: "Coating", value: formatText(specs.coating) },
      { label: "Rackable", value: formatBool(specs.rackable) },
    );
  }

  if (product.bench_specs && Object.keys(product.bench_specs).length > 0) {
    for (const [key, value] of Object.entries(product.bench_specs)) {
      rows.push({ label: key.replaceAll("_", " "), value: formatBenchValue(value) });
    }
  }

  if (product.dimensions) {
    const heightLabel = product.category === "rack" ? "Upright height" : "Height";
    rows.push(
      { label: heightLabel, value: dimensionValue(product, "height_in") },
      {
        label: "Minimum ceiling",
        value: dimensionValue(product, "min_ceiling_in"),
        hint: ceilingUsesUprightHeight(product) ? CEILING_HINT : undefined,
      },
      { label: "Width", value: dimensionValue(product, "width_in") },
      { label: "Open depth", value: dimensionValue(product, "depth_open_in") },
      { label: "Folded depth", value: dimensionValue(product, "depth_folded_in") },
      { label: "Footprint", value: dimensionValue(product, "footprint_sqft") },
      { label: "Unit weight", value: dimensionValue(product, "unit_weight_lbs") },
    );
  }

  if (product.installation == null) {
    rows.push({
      label: "Installation",
      value: product.category === "rack" ? "Unverified" : "N/A",
    });
  } else {
    rows.push(
      { label: "Wall mount required", value: formatBool(product.installation.wall_mount_required) },
      { label: "Floor bolt required", value: formatBool(product.installation.floor_bolt_required) },
      { label: "Stud spacing", value: formatStudSpacing(product) },
      { label: "Renter-friendly", value: formatBool(product.installation.renter_friendly) },
      { label: "Fold direction", value: formatFoldDirection(product) },
    );
  }

  return rows;
}

function formatBenchValue(value: string | number | boolean | null): string {
  if (value == null) return "Unverified";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return formatNumber(value);
  return value;
}
