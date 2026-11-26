import type { GymProduct } from "@/lib/types";

const PRODUCT_KEYS = [
  "id",
  "slug",
  "brand",
  "model",
  "sku",
  "category",
  "dimensions",
  "installation",
  "rack_specs",
  "barbell_specs",
  "bench_specs",
  "verification",
  "affiliates",
] as const;

const DIMENSION_KEYS = [
  "height_in",
  "min_ceiling_in",
  "width_in",
  "depth_open_in",
  "depth_folded_in",
  "footprint_sqft",
  "unit_weight_lbs",
] as const;

const INSTALLATION_KEYS = [
  "wall_mount_required",
  "floor_bolt_required",
  "stud_spacing_in",
  "renter_friendly",
  "fold_direction",
] as const;

const RACK_SPEC_KEYS = [
  "rack_type",
  "upright_size_in",
  "steel_gauge",
  "hole_size_in",
  "hole_spacing_in",
  "weight_capacity_lbs",
  "pullup_bar_included",
  "safeties_included",
  "j_cups_included",
] as const;

const BARBELL_SPEC_KEYS = [
  "overall_length_in",
  "shaft_length_in",
  "loadable_sleeve_length_in",
  "shaft_diameter_mm",
  "sleeve_diameter_in",
  "tensile_strength_psi",
  "weight_capacity_lbs",
  "knurl_marks",
  "center_knurl",
  "bushing_or_bearing",
  "coating",
  "rackable",
] as const;

const VERIFICATION_KEYS = [
  "spec_sheet_url",
  "additional_source_urls",
  "last_verified_date",
  "verification_status",
  "unverified_fields",
  "notes",
] as const;

const AFFILIATE_KEYS = [
  "manufacturer_url",
  "rep_affiliate_eligible",
  "amazon_asin",
] as const;

const CATEGORIES = new Set(["rack", "bench", "barbell"]);
const RACK_TYPES = new Set([
  "folding-wall",
  "compact-power-rack",
  "half-rack",
  "squat-stand",
]);
const FOLD_DIRECTIONS = new Set(["inward", "outward", "upward", "none"]);
const VERIFICATION_STATUSES = new Set(["verified", "partial", "unverified"]);
const BANNED_KEY_PARTS = new Set([
  "price",
  "prices",
  "msrp",
  "stock",
  "inventory",
  "availability",
  "rating",
  "ratings",
  "stars",
  "review",
  "reviews",
  "offer",
  "offers",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isForbiddenKey(key: string): boolean {
  const normalized = key.replace(/[-\s]/g, "_").toLowerCase();
  if (normalized.includes("aggregaterating")) return true;
  return normalized
    .split("_")
    .filter((part) => part.length > 0)
    .some((part) => BANNED_KEY_PARTS.has(part));
}

function walkForbidden(value: unknown, path: string, errors: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkForbidden(item, `${path}[${index}]`, errors));
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    const next = `${path}.${key}`;
    if (isForbiddenKey(key)) {
      errors.push(`${next} is forbidden (no price, stock, or rating fields)`);
    }
    walkForbidden(child, next, errors);
  }
}

function rejectUnknown(
  record: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  errors: string[],
): void {
  for (const key of Object.keys(record)) {
    if (!allowed.includes(key)) {
      errors.push(`${path}.${key} is not a known field`);
    }
  }
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.length > 0;
  } catch {
    return false;
  }
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isPositiveOrNull(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value) && value > 0);
}

function isBooleanOrNull(value: unknown): value is boolean | null {
  return value === null || typeof value === "boolean";
}

function isNonEmptyOrNull(value: unknown): value is string | null {
  return value === null || (typeof value === "string" && value.trim().length > 0);
}

function requireKeys(
  record: Record<string, unknown>,
  keys: readonly string[],
  path: string,
  errors: string[],
): void {
  for (const key of keys) {
    if (!(key in record)) errors.push(`${path}.${key} is required`);
  }
}

function validateProduct(
  input: unknown,
  index: number,
  errors: string[],
  ids: Set<string>,
  slugs: Set<string>,
): void {
  const path = `products[${index}]`;
  if (!isRecord(input)) {
    errors.push(`${path} must be an object`);
    return;
  }
  rejectUnknown(input, PRODUCT_KEYS, path, errors);

  const id = input.id;
  const slug = input.slug;
  if (typeof id !== "string" || id.trim().length === 0) {
    errors.push(`${path}.id must be a non-empty string`);
  } else if (ids.has(id)) {
    errors.push(`${path}.id duplicates "${id}"`);
  } else {
    ids.add(id);
  }
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.push(`${path}.slug must be a lowercase hyphenated string`);
  } else if (slugs.has(slug)) {
    errors.push(`${path}.slug duplicates "${slug}"`);
  } else {
    slugs.add(slug);
  }
  if (typeof input.brand !== "string" || input.brand.trim().length === 0) {
    errors.push(`${path}.brand must be a non-empty string`);
  }
  if (typeof input.model !== "string" || input.model.trim().length === 0) {
    errors.push(`${path}.model must be a non-empty string`);
  }
  if (!isNonEmptyOrNull(input.sku)) {
    errors.push(`${path}.sku must be a non-empty string or null`);
  }
  if (typeof input.category !== "string" || !CATEGORIES.has(input.category)) {
    errors.push(`${path}.category must be rack, bench, or barbell`);
    return;
  }

  const category = input.category;
  if (category === "rack" && input.dimensions == null) {
    errors.push(`${path}.dimensions is required for racks`);
  }
  if (input.dimensions != null) validateDimensions(input.dimensions, path, errors);

  if (category === "rack" && !isRecord(input.installation)) {
    errors.push(`${path}.installation is required for racks`);
  } else if (input.installation != null) {
    validateInstallation(input.installation, path, errors);
  }

  if (category === "rack") {
    if (!isRecord(input.rack_specs)) errors.push(`${path}.rack_specs is required for racks`);
    else validateRackSpecs(input.rack_specs, path, errors);
    if (input.barbell_specs != null) errors.push(`${path}.barbell_specs must be omitted or null on a rack`);
    if (input.bench_specs != null) errors.push(`${path}.bench_specs must be omitted or null on a rack`);
  } else if (category === "barbell") {
    if (!isRecord(input.barbell_specs)) {
      errors.push(`${path}.barbell_specs is required for barbells`);
    } else {
      validateBarbellSpecs(input.barbell_specs, path, errors);
    }
    if (input.rack_specs != null) errors.push(`${path}.rack_specs must be omitted or null on a barbell`);
    if (input.bench_specs != null) errors.push(`${path}.bench_specs must be omitted or null on a barbell`);
  } else {
    if (input.rack_specs != null) errors.push(`${path}.rack_specs must be omitted or null on a bench`);
    if (input.barbell_specs != null) {
      errors.push(`${path}.barbell_specs must be omitted or null on a bench`);
    }
    if (input.bench_specs != null) validateBenchSpecs(input.bench_specs, path, errors);
  }

  validateVerification(input.verification, path, errors);
  validateAffiliates(input.affiliates, path, errors);
}

function validateDimensions(input: unknown, path: string, errors: string[]): void {
  const field = `${path}.dimensions`;
  if (!isRecord(input)) {
    errors.push(`${field} must be an object`);
    return;
  }
  rejectUnknown(input, DIMENSION_KEYS, field, errors);
  requireKeys(input, DIMENSION_KEYS, field, errors);
  for (const key of DIMENSION_KEYS) {
    if (key in input && !isPositiveOrNull(input[key])) {
      errors.push(`${field}.${key} must be a positive number or null`);
    }
  }
}

function validateInstallation(input: unknown, path: string, errors: string[]): void {
  const field = `${path}.installation`;
  if (!isRecord(input)) {
    errors.push(`${field} must be an object or null`);
    return;
  }
  rejectUnknown(input, INSTALLATION_KEYS, field, errors);
  requireKeys(input, INSTALLATION_KEYS, field, errors);
  for (const key of ["wall_mount_required", "floor_bolt_required", "renter_friendly"] as const) {
    if (key in input && !isBooleanOrNull(input[key])) {
      errors.push(`${field}.${key} must be a boolean or null`);
    }
  }
  if ("stud_spacing_in" in input && !isStudSpacing(input.stud_spacing_in)) {
    errors.push(`${field}.stud_spacing_in must be an array of positive numbers or null`);
  }
  if (
    "fold_direction" in input &&
    input.fold_direction !== null &&
    (typeof input.fold_direction !== "string" || !FOLD_DIRECTIONS.has(input.fold_direction))
  ) {
    errors.push(`${field}.fold_direction must be inward, outward, upward, none, or null`);
  }
}

function isStudSpacing(value: unknown): boolean {
  if (value === null) return true;
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "number" && Number.isFinite(item) && item > 0)
  );
}

function validateRackSpecs(input: Record<string, unknown>, path: string, errors: string[]): void {
  const field = `${path}.rack_specs`;
  rejectUnknown(input, RACK_SPEC_KEYS, field, errors);
  requireKeys(input, RACK_SPEC_KEYS, field, errors);
  if ("rack_type" in input && (typeof input.rack_type !== "string" || !RACK_TYPES.has(input.rack_type))) {
    errors.push(`${field}.rack_type is not a known rack type`);
  }
  for (const key of ["upright_size_in", "hole_spacing_in"] as const) {
    if (key in input && !isNonEmptyOrNull(input[key])) {
      errors.push(`${field}.${key} must be a non-empty string or null`);
    }
  }
  for (const key of ["steel_gauge", "hole_size_in", "weight_capacity_lbs"] as const) {
    if (key in input && !isPositiveOrNull(input[key])) {
      errors.push(`${field}.${key} must be a positive number or null`);
    }
  }
  for (const key of ["pullup_bar_included", "safeties_included", "j_cups_included"] as const) {
    if (key in input && !isBooleanOrNull(input[key])) {
      errors.push(`${field}.${key} must be a boolean or null`);
    }
  }
}

function validateBarbellSpecs(input: Record<string, unknown>, path: string, errors: string[]): void {
  const field = `${path}.barbell_specs`;
  rejectUnknown(input, BARBELL_SPEC_KEYS, field, errors);
  requireKeys(input, BARBELL_SPEC_KEYS, field, errors);
  for (const key of [
    "overall_length_in",
    "shaft_length_in",
    "loadable_sleeve_length_in",
    "shaft_diameter_mm",
    "sleeve_diameter_in",
    "tensile_strength_psi",
    "weight_capacity_lbs",
  ] as const) {
    if (key in input && !isPositiveOrNull(input[key])) {
      errors.push(`${field}.${key} must be a positive number or null`);
    }
  }
  for (const key of ["knurl_marks", "center_knurl", "rackable"] as const) {
    if (key in input && !isBooleanOrNull(input[key])) {
      errors.push(`${field}.${key} must be a boolean or null`);
    }
  }
  for (const key of ["bushing_or_bearing", "coating"] as const) {
    if (key in input && !isNonEmptyOrNull(input[key])) {
      errors.push(`${field}.${key} must be a non-empty string or null`);
    }
  }
}

function validateBenchSpecs(input: unknown, path: string, errors: string[]): void {
  const field = `${path}.bench_specs`;
  if (!isRecord(input)) {
    errors.push(`${field} must be an object or null`);
    return;
  }
  for (const [key, value] of Object.entries(input)) {
    if (isForbiddenKey(key)) continue;
    const scalar =
      value === null ||
      typeof value === "string" ||
      typeof value === "boolean" ||
      (typeof value === "number" && Number.isFinite(value));
    if (!scalar) errors.push(`${field}.${key} must be a string, number, boolean, or null`);
  }
}

function validateVerification(input: unknown, path: string, errors: string[]): void {
  const field = `${path}.verification`;
  if (!isRecord(input)) {
    errors.push(`${field} is required`);
    return;
  }
  rejectUnknown(input, VERIFICATION_KEYS, field, errors);
  requireKeys(input, VERIFICATION_KEYS, field, errors);
  if ("spec_sheet_url" in input && !isHttpsUrl(input.spec_sheet_url)) {
    errors.push(`${field}.spec_sheet_url must be an https URL`);
  }
  if ("additional_source_urls" in input) {
    if (!Array.isArray(input.additional_source_urls)) {
      errors.push(`${field}.additional_source_urls must be an array`);
    } else {
      input.additional_source_urls.forEach((url, index) => {
        if (!isHttpsUrl(url)) {
          errors.push(`${field}.additional_source_urls[${index}] must be an https URL`);
        }
      });
    }
  }
  if ("last_verified_date" in input && !isIsoDate(input.last_verified_date)) {
    errors.push(`${field}.last_verified_date must be YYYY-MM-DD`);
  }
  if (
    "verification_status" in input &&
    (typeof input.verification_status !== "string" ||
      !VERIFICATION_STATUSES.has(input.verification_status))
  ) {
    errors.push(`${field}.verification_status must be verified, partial, or unverified`);
  }
  if ("unverified_fields" in input) {
    if (!Array.isArray(input.unverified_fields)) {
      errors.push(`${field}.unverified_fields must be an array`);
    } else if (
      input.unverified_fields.some((item) => typeof item !== "string" || item.trim().length === 0)
    ) {
      errors.push(`${field}.unverified_fields must contain non-empty strings`);
    }
  }
  if ("notes" in input && (typeof input.notes !== "string" || input.notes.trim().length === 0)) {
    errors.push(`${field}.notes must be a non-empty string`);
  }
}

function validateAffiliates(input: unknown, path: string, errors: string[]): void {
  const field = `${path}.affiliates`;
  if (!isRecord(input)) {
    errors.push(`${field} is required`);
    return;
  }
  rejectUnknown(input, AFFILIATE_KEYS, field, errors);
  requireKeys(input, AFFILIATE_KEYS, field, errors);
  if ("manufacturer_url" in input && !isHttpsUrl(input.manufacturer_url)) {
    errors.push(`${field}.manufacturer_url must be an https URL`);
  }
  if ("rep_affiliate_eligible" in input && typeof input.rep_affiliate_eligible !== "boolean") {
    errors.push(`${field}.rep_affiliate_eligible must be a boolean`);
  }
  if ("amazon_asin" in input && !isNonEmptyOrNull(input.amazon_asin)) {
    errors.push(`${field}.amazon_asin must be a non-empty string or null`);
  }
}

export function validateCatalog(input: unknown): string[] {
  const errors: string[] = [];
  walkForbidden(input, "catalog", errors);
  if (!Array.isArray(input)) {
    errors.push("catalog must be a JSON array");
    return errors;
  }
  const ids = new Set<string>();
  const slugs = new Set<string>();
  input.forEach((item, index) => validateProduct(item, index, errors, ids, slugs));
  return errors;
}

export function assertCatalog(input: unknown): GymProduct[] {
  const errors = validateCatalog(input);
  if (errors.length > 0) {
    throw new Error(`data/products.json is invalid:\n${errors.join("\n")}`);
  }
  return input as GymProduct[];
}
