import fs from "node:fs";
import path from "node:path";
import { assertCatalog } from "@/lib/validate";
import type { GymProduct, ProductCategory, RackType } from "@/lib/types";

let cached: GymProduct[] | null = null;

export function getProducts(): GymProduct[] {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "data", "products.json");
  const parsed: unknown = JSON.parse(fs.readFileSync(filePath, "utf8"));
  cached = assertCatalog(parsed);
  return cached;
}

export function getProductBySlug(slug: string): GymProduct | undefined {
  return getProducts().find((product) => product.slug === slug);
}

export function getProductById(id: string): GymProduct | undefined {
  return getProducts().find((product) => product.id === id);
}

export interface CatalogStats {
  total: number;
  byCategory: Record<ProductCategory, number>;
  byRackType: Record<RackType, number>;
  foldingWall: number;
  noWallMount: number;
  statedMinCeiling: number;
  brands: number;
  latestVerified: string | null;
}

export function catalogStats(products: GymProduct[]): CatalogStats {
  const byCategory: Record<ProductCategory, number> = { rack: 0, bench: 0, barbell: 0 };
  const byRackType: Record<RackType, number> = {
    "folding-wall": 0,
    "compact-power-rack": 0,
    "half-rack": 0,
    "squat-stand": 0,
  };
  const brands = new Set<string>();
  let noWallMount = 0;
  let statedMinCeiling = 0;
  let latestVerified: string | null = null;

  for (const product of products) {
    byCategory[product.category] += 1;
    brands.add(product.brand);
    const rackType = product.rack_specs?.rack_type;
    if (rackType) byRackType[rackType] += 1;
    if (product.installation?.wall_mount_required === false) noWallMount += 1;
    if (product.dimensions?.min_ceiling_in != null) statedMinCeiling += 1;
    if (latestVerified == null || product.verification.last_verified_date > latestVerified) {
      latestVerified = product.verification.last_verified_date;
    }
  }

  return {
    total: products.length,
    byCategory,
    byRackType,
    foldingWall: byRackType["folding-wall"],
    noWallMount,
    statedMinCeiling,
    brands: brands.size,
    latestVerified,
  };
}
