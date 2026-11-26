import type { GymProduct, ProductCategory, RackType } from "@/lib/types";

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
}

export function formatNumber(value: number): string {
  return Object.is(value, -0) ? "0" : String(value);
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
  return direction;
}

export function formatFoldedDepth(product: GymProduct): string {
  const depth = product.dimensions?.depth_folded_in;
  if (depth != null) return formatInches(depth);
  if (product.installation?.fold_direction === "none") return "N/A";
  if (product.installation == null && product.category !== "rack") return "N/A";
  return "Unverified";
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
      { label: "Knurl marks", value: formatBool(specs.knurl_marks) },
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
    rows.push(
      { label: "Upright height", value: formatInches(product.dimensions.height_in) },
      { label: "Minimum ceiling", value: formatInches(product.dimensions.min_ceiling_in) },
      { label: "Width", value: formatInches(product.dimensions.width_in) },
      { label: "Open depth", value: formatInches(product.dimensions.depth_open_in) },
      { label: "Folded depth", value: formatFoldedDepth(product) },
      { label: "Footprint", value: formatSqft(product.dimensions.footprint_sqft) },
      { label: "Unit weight", value: formatPounds(product.dimensions.unit_weight_lbs) },
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
      { label: "Renter-friendly flag", value: formatBool(product.installation.renter_friendly) },
      { label: "Fold direction", value: formatFoldDirection(product) },
    );
  }

  if (ceilingUsesUprightHeight(product)) {
    rows.push({
      label: "Ceiling note",
      value:
        "Minimum ceiling is unverified. Only upright height is published. That height is not a clearance calculation.",
    });
  }

  return rows;
}

function formatBenchValue(value: string | number | boolean | null): string {
  if (value == null) return "Unverified";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return formatNumber(value);
  return value;
}
