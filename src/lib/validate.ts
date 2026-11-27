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
  "dumbbell_specs",
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

const BENCH_SPEC_KEYS = [
  "bench_type",
  "vertical_storage",
  "stored_height_in",
  "stored_width_in",
  "stored_depth_in",
  "stored_footprint_sqft",
  "pad_width_in",
  "pad_thickness_in",
  "pad_gap_in",
  "back_pad_positions",
  "seat_pad_positions",
  "decline_capable",
  "weight_capacity_lbs",
  "transport_wheels",
] as const;

const BENCH_NUMBER_KEYS = [
  "stored_height_in",
  "stored_width_in",
  "stored_depth_in",
  "stored_footprint_sqft",
  "pad_width_in",
  "pad_thickness_in",
  "pad_gap_in",
  "back_pad_positions",
  "seat_pad_positions",
  "weight_capacity_lbs",
] as const;

const BENCH_BOOLEAN_KEYS = ["vertical_storage", "decline_capable", "transport_wheels"] as const;

const UNPUBLISHED_BENCH_STORAGE = [
  "bench_specs.stored_height_in",
  "bench_specs.stored_width_in",
  "bench_specs.stored_depth_in",
  "dimensions.depth_folded_in",
] as const;

const DUMBBELL_SPEC_KEYS = [
  "min_weight_lbs",
  "max_weight_lbs",
  "weight_increment_lbs",
  "adjustment_mechanism",
  "handle_diameter_mm",
  "handle_length_in",
  "tray_included",
  "tray_length_in",
  "tray_width_in",
  "tray_height_in",
  "stand_included",
  "expandable",
  "sold_as",
] as const;

const DUMBBELL_NUMBER_KEYS = [
  "min_weight_lbs",
  "max_weight_lbs",
  "weight_increment_lbs",
  "handle_diameter_mm",
  "handle_length_in",
  "tray_length_in",
  "tray_width_in",
  "tray_height_in",
] as const;

const DUMBBELL_BOOLEAN_KEYS = ["tray_included", "stand_included", "expandable"] as const;

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

const CATEGORIES = new Set(["rack", "bench", "barbell", "dumbbell"]);
const ADJUSTMENT_MECHANISMS = new Set([
  "selector-pin",
  "twist-handle",
  "lock-switch",
  "quick-lock-screw",
  "dial",
]);
const SOLD_AS = new Set(["pair", "single"]);
const RACK_TYPES = new Set([
  "folding-wall",
  "compact-power-rack",
  "half-rack",
  "squat-stand",
]);
const BENCH_TYPES = new Set(["adjustable", "flat"]);
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
    errors.push(`${path}.category must be rack, bench, barbell, or dumbbell`);
    return;
  }

  const category = input.category;
  if (
    (category === "rack" || category === "bench" || category === "dumbbell") &&
    input.dimensions == null
  ) {
    const label = category === "rack" ? "racks" : category === "bench" ? "benches" : "dumbbells";
    errors.push(`${path}.dimensions is required for ${label}`);
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
    if (input.dumbbell_specs != null) {
      errors.push(`${path}.dumbbell_specs must be omitted or null on a rack`);
    }
  } else if (category === "barbell") {
    if (!isRecord(input.barbell_specs)) {
      errors.push(`${path}.barbell_specs is required for barbells`);
    } else {
      validateBarbellSpecs(input.barbell_specs, path, errors);
    }
    if (input.rack_specs != null) errors.push(`${path}.rack_specs must be omitted or null on a barbell`);
    if (input.bench_specs != null) errors.push(`${path}.bench_specs must be omitted or null on a barbell`);
    if (input.dumbbell_specs != null) {
      errors.push(`${path}.dumbbell_specs must be omitted or null on a barbell`);
    }
  } else if (category === "bench") {
    if ("installation" in input) errors.push(`${path}.installation must be omitted on a bench`);
    if ("rack_specs" in input) errors.push(`${path}.rack_specs must be omitted on a bench`);
    if ("barbell_specs" in input) errors.push(`${path}.barbell_specs must be omitted on a bench`);
    if ("dumbbell_specs" in input) errors.push(`${path}.dumbbell_specs must be omitted on a bench`);
    if (!isRecord(input.bench_specs)) {
      errors.push(`${path}.bench_specs is required for benches`);
    } else {
      validateBenchSpecs(input.bench_specs, path, errors);
    }
    validateUnpublishedBenchStorage(input, path, errors);
  } else {
    if ("installation" in input) errors.push(`${path}.installation must be omitted on a dumbbell`);
    if ("rack_specs" in input) errors.push(`${path}.rack_specs must be omitted on a dumbbell`);
    if ("barbell_specs" in input) errors.push(`${path}.barbell_specs must be omitted on a dumbbell`);
    if ("bench_specs" in input) errors.push(`${path}.bench_specs must be omitted on a dumbbell`);
    if (!isRecord(input.dumbbell_specs)) {
      errors.push(`${path}.dumbbell_specs is required for dumbbells`);
    } else {
      validateDumbbellSpecs(input.dumbbell_specs, path, errors);
    }
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
  if ("knurl_marks" in input && !isNonEmptyOrNull(input.knurl_marks)) {
    errors.push(`${field}.knurl_marks must be a non-empty string or null`);
  }
  for (const key of ["center_knurl", "rackable"] as const) {
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

function validateBenchSpecs(input: Record<string, unknown>, path: string, errors: string[]): void {
  const field = `${path}.bench_specs`;
  rejectUnknown(input, BENCH_SPEC_KEYS, field, errors);
  requireKeys(input, BENCH_SPEC_KEYS, field, errors);
  if ("bench_type" in input) {
    const benchType = input.bench_type;
    if (benchType !== null && (typeof benchType !== "string" || !BENCH_TYPES.has(benchType))) {
      errors.push(`${field}.bench_type must be adjustable, flat, or null`);
    }
  }
  for (const key of BENCH_NUMBER_KEYS) {
    if (key in input && !isPositiveOrNull(input[key])) {
      errors.push(`${field}.${key} must be a positive number or null`);
    }
  }
  for (const key of BENCH_BOOLEAN_KEYS) {
    if (key in input && !isBooleanOrNull(input[key])) {
      errors.push(`${field}.${key} must be a boolean or null`);
    }
  }
}

function validateDumbbellSpecs(input: Record<string, unknown>, path: string, errors: string[]): void {
  const field = `${path}.dumbbell_specs`;
  rejectUnknown(input, DUMBBELL_SPEC_KEYS, field, errors);
  requireKeys(input, DUMBBELL_SPEC_KEYS, field, errors);
  for (const key of DUMBBELL_NUMBER_KEYS) {
    if (key in input && !isPositiveOrNull(input[key])) {
      errors.push(`${field}.${key} must be a positive number or null`);
    }
  }
  for (const key of DUMBBELL_BOOLEAN_KEYS) {
    if (key in input && !isBooleanOrNull(input[key])) {
      errors.push(`${field}.${key} must be a boolean or null`);
    }
  }
  if ("adjustment_mechanism" in input) {
    const mechanism = input.adjustment_mechanism;
    if (mechanism !== null && (typeof mechanism !== "string" || !ADJUSTMENT_MECHANISMS.has(mechanism))) {
      errors.push(
        `${field}.adjustment_mechanism must be selector-pin, twist-handle, lock-switch, quick-lock-screw, dial, or null`,
      );
    }
  }
  if ("sold_as" in input) {
    const soldAs = input.sold_as;
    if (soldAs !== null && (typeof soldAs !== "string" || !SOLD_AS.has(soldAs))) {
      errors.push(`${field}.sold_as must be pair, single, or null`);
    }
  }
}

function validateUnpublishedBenchStorage(
  input: Record<string, unknown>,
  path: string,
  errors: string[],
): void {
  const dimensions = isRecord(input.dimensions) ? input.dimensions : null;
  const bench = isRecord(input.bench_specs) ? input.bench_specs : null;
  const verification = isRecord(input.verification) ? input.verification : null;
  if (!dimensions || !bench || !verification || !Array.isArray(verification.unverified_fields)) return;
  const listed = verification.unverified_fields.filter((item): item is string => typeof item === "string");
  const values: Record<(typeof UNPUBLISHED_BENCH_STORAGE)[number], unknown> = {
    "bench_specs.stored_height_in": bench.stored_height_in,
    "bench_specs.stored_width_in": bench.stored_width_in,
    "bench_specs.stored_depth_in": bench.stored_depth_in,
    "dimensions.depth_folded_in": dimensions.depth_folded_in,
  };
  for (const fieldPath of UNPUBLISHED_BENCH_STORAGE) {
    const missing = values[fieldPath] == null;
    const flagged = listed.includes(fieldPath);
    if (missing && !flagged) {
      errors.push(`${path}.${fieldPath} is null and must be listed in verification.unverified_fields`);
    }
    if (!missing && flagged) {
      errors.push(`${path}.${fieldPath} is published and must not be listed in verification.unverified_fields`);
    }
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
