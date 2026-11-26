import type { GymProduct } from "@/lib/types";

export interface FitPreset {
  slug: string;
  title: string;
  criteria: string;
  matches: (product: GymProduct) => boolean;
}

export const fitPresets: FitPreset[] = [
  {
    slug: "under-8-foot-ceiling",
    title: "Under an 8-foot ceiling",
    criteria:
      "Included when upright height is 92 inches or less, or the manufacturer states a minimum ceiling (min_ceiling_in) of 96 inches or less. A product that meets neither published test is omitted. Upright height is not converted into a clearance allowance.",
    matches: (product) => {
      const height = product.dimensions?.height_in;
      const ceiling = product.dimensions?.min_ceiling_in;
      return (height != null && height <= 92) || (ceiling != null && ceiling <= 96);
    },
  },
  {
    slug: "under-84-inch-ceiling",
    title: "Under an 84-inch ceiling",
    criteria:
      "Included when upright height is 84 inches or less. Products with no published upright height are omitted. No clearance is added to the published height.",
    matches: (product) => {
      const height = product.dimensions?.height_in;
      return height != null && height <= 84;
    },
  },
  {
    slug: "renter-friendly-no-wall-mount",
    title: "Renter-friendly, no wall mount",
    criteria:
      "Included when wall_mount_required is false. A null renter_friendly flag stays unverified and is not treated as a yes. Products with no installation record are omitted.",
    matches: (product) => product.installation?.wall_mount_required === false,
  },
  {
    slug: "folding-wall-racks",
    title: "Folding wall racks",
    criteria: "Included when rack_type is folding-wall.",
    matches: (product) => product.rack_specs?.rack_type === "folding-wall",
  },
  {
    slug: "compact-power-racks",
    title: "Compact power racks",
    criteria: "Included when rack_type is compact-power-rack.",
    matches: (product) => product.rack_specs?.rack_type === "compact-power-rack",
  },
  {
    slug: "half-racks",
    title: "Half racks",
    criteria: "Included when rack_type is half-rack.",
    matches: (product) => product.rack_specs?.rack_type === "half-rack",
  },
  {
    slug: "squat-stands",
    title: "Squat stands",
    criteria: "Included when rack_type is squat-stand.",
    matches: (product) => product.rack_specs?.rack_type === "squat-stand",
  },
];

export function getFitPreset(slug: string): FitPreset | undefined {
  return fitPresets.find((preset) => preset.slug === slug);
}
