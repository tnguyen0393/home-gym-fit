export type ProductCategory = "rack" | "bench" | "barbell" | "dumbbell";

export type FoldDirection = "inward" | "outward" | "upward" | "none" | null;

export type RackType =
  | "folding-wall"
  | "compact-power-rack"
  | "half-rack"
  | "squat-stand";

export type VerificationStatus = "verified" | "partial" | "unverified";

export interface ProductDimensions {
  height_in: number | null;
  min_ceiling_in: number | null;
  width_in: number | null;
  depth_open_in: number | null;
  depth_folded_in: number | null;
  footprint_sqft: number | null;
  unit_weight_lbs: number | null;
}

export interface ProductInstallation {
  wall_mount_required: boolean | null;
  floor_bolt_required: boolean | null;
  stud_spacing_in: number[] | null;
  renter_friendly: boolean | null;
  fold_direction: FoldDirection;
}

export interface RackSpecs {
  rack_type: RackType;
  upright_size_in: string | null;
  steel_gauge: number | null;
  hole_size_in: number | null;
  hole_spacing_in: string | null;
  weight_capacity_lbs: number | null;
  pullup_bar_included: boolean | null;
  safeties_included: boolean | null;
  j_cups_included: boolean | null;
}

/** Short rackable barbells. Measurements stay null until a manufacturer value is recorded. */
export interface BarbellSpecs {
  overall_length_in: number | null;
  shaft_length_in: number | null;
  loadable_sleeve_length_in: number | null;
  shaft_diameter_mm: number | null;
  sleeve_diameter_in: number | null;
  tensile_strength_psi: number | null;
  weight_capacity_lbs: number | null;
  knurl_marks: string | null;
  center_knurl: boolean | null;
  bushing_or_bearing: string | null;
  coating: string | null;
  rackable: boolean | null;
}

export type BenchType = "adjustable" | "flat";

/**
 * Adjustable dumbbells. Every field is a flat scalar and stays null
 * until the manufacturer publishes it.
 */
export interface DumbbellSpecs {
  min_weight_lbs: number | null;
  max_weight_lbs: number | null;
  weight_increment_lbs: number | null;
  adjustment_mechanism:
    | "selector-pin"
    | "twist-handle"
    | "lock-switch"
    | "quick-lock-screw"
    | "dial"
    | null;
  handle_diameter_mm: number | null;
  handle_length_in: number | null;
  tray_included: boolean | null;
  tray_length_in: number | null;
  tray_width_in: number | null;
  tray_height_in: number | null;
  stand_included: boolean | null;
  expandable: boolean | null;
  sold_as: "pair" | "single" | null;
}

/**
 * Vertical-storage benches. Every field is a flat scalar and stays null
 * until the manufacturer publishes it.
 */
export interface BenchSpecs {
  bench_type: BenchType | null;
  vertical_storage: boolean | null;
  stored_height_in: number | null;
  stored_width_in: number | null;
  stored_depth_in: number | null;
  stored_footprint_sqft: number | null;
  pad_width_in: number | null;
  pad_thickness_in: number | null;
  pad_gap_in: number | null;
  back_pad_positions: number | null;
  seat_pad_positions: number | null;
  decline_capable: boolean | null;
  weight_capacity_lbs: number | null;
  transport_wheels: boolean | null;
}

export interface ProductVerification {
  spec_sheet_url: string;
  additional_source_urls: string[];
  last_verified_date: string;
  verification_status: VerificationStatus;
  unverified_fields: string[];
  notes: string;
}

export interface ProductAffiliates {
  manufacturer_url: string;
  rep_affiliate_eligible: boolean;
  amazon_asin: string | null;
}

export interface GymProduct {
  id: string;
  slug: string;
  brand: string;
  model: string;
  sku: string | null;
  category: ProductCategory;
  dimensions?: ProductDimensions | null;
  /** Required for racks. Omitted on benches and dumbbells. Optional and nullable for barbells. */
  installation?: ProductInstallation | null;
  rack_specs?: RackSpecs | null;
  barbell_specs?: BarbellSpecs | null;
  /** Required for benches. Omitted on racks, barbells, and dumbbells. */
  bench_specs?: BenchSpecs | null;
  /** Required for dumbbells. Omitted on racks, barbells, and benches. */
  dumbbell_specs?: DumbbellSpecs | null;
  verification: ProductVerification;
  affiliates: ProductAffiliates;
}

export type ArticleType = "guide" | "compare" | "explainer";

/**
 * YAML frontmatter contract for content/guides and content/compare.
 * Explainers use type "explainer", live in content/guides, and route to /guides/[slug]/.
 */
export interface ArticleFrontmatter {
  title: string;
  description: string;
  slug: string;
  type: ArticleType;
  publishedAt: string;
  updatedAt: string;
  productIds: string[];
  constraintTags?: string[];
  lastVerifiedDate?: string;
  testingStatus?: string;
  ftcDisclosure?: boolean;
}

export interface ArticleDocument extends ArticleFrontmatter {
  body: string;
}
