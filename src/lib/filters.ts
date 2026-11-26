import { ceilingReferenceIn, isFoldingProduct } from "@/lib/format";
import type { GymProduct, ProductCategory, RackType } from "@/lib/types";

export interface DirectoryFilters {
  category: "any" | ProductCategory;
  rackType: "any" | RackType;
  renterOnly: boolean;
  foldingOnly: boolean;
  verticalStorage: boolean;
  maxCeilingIn: number | null;
  maxFoldedDepthIn: number | null;
  maxBarLengthIn: number | null;
}

export function matchesDirectoryFilters(product: GymProduct, filters: DirectoryFilters): boolean {
  if (filters.category !== "any" && product.category !== filters.category) return false;
  if (filters.rackType !== "any" && product.rack_specs?.rack_type !== filters.rackType) return false;
  if (filters.renterOnly && product.installation?.wall_mount_required !== false) return false;
  if (filters.foldingOnly && !isFoldingProduct(product)) return false;
  if (filters.verticalStorage && product.bench_specs?.vertical_storage !== true) return false;

  if (filters.maxCeilingIn != null && product.category === "rack") {
    const ceiling = ceilingReferenceIn(product);
    if (ceiling == null || ceiling > filters.maxCeilingIn) return false;
  }

  if (filters.maxFoldedDepthIn != null && product.category !== "barbell") {
    const depth = product.dimensions?.depth_folded_in;
    if (depth == null || depth > filters.maxFoldedDepthIn) return false;
  }

  if (filters.maxBarLengthIn != null && product.category === "barbell") {
    const length = product.barbell_specs?.overall_length_in;
    if (length == null || length > filters.maxBarLengthIn) return false;
  }

  return true;
}
