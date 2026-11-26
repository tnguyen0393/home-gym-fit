import type { GymProduct } from "@/lib/types";

export interface FitPreset {
  slug: string;
  title: string;
  summary: string;
  criteria: string;
  matches: (product: GymProduct) => boolean;
}

export const fitPresets: FitPreset[] = [
  {
    slug: "under-8-foot-ceiling",
    title: "Under an 8-foot ceiling",
    summary: "Racks at or under 92 inches, or with a stated ceiling of 96 inches or less.",
    criteria:
      "Includes a rack when its published upright height is 92 inches or less, or the manufacturer states a minimum ceiling of 96 inches or less. A rack that meets neither published test is left out. Upright height is not turned into a clearance allowance.",
    matches: (product) => {
      const height = product.dimensions?.height_in;
      const ceiling = product.dimensions?.min_ceiling_in;
      return (height != null && height <= 92) || (ceiling != null && ceiling <= 96);
    },
  },
  {
    slug: "under-84-inch-ceiling",
    title: "Under an 84-inch ceiling",
    summary: "Racks whose published upright height is 84 inches or less.",
    criteria:
      "Includes a rack when its published upright height is 84 inches or less. Racks with no published upright height are left out. No clearance is added to the published height.",
    matches: (product) => {
      const height = product.dimensions?.height_in;
      return height != null && height <= 84;
    },
  },
  {
    slug: "renter-friendly-no-wall-mount",
    title: "Renter-friendly, no wall mount",
    summary: "Gear the manufacturer says does not need a wall mount.",
    criteria:
      "Includes a product when the manufacturer says a wall mount is not required. A missing renter-friendly answer stays unverified and is not treated as a yes. Products with no installation record are left out.",
    matches: (product) => product.installation?.wall_mount_required === false,
  },
  {
    slug: "folding-wall-racks",
    title: "Folding wall racks",
    summary: "Wall racks that fold out of the way after the set.",
    criteria: "Includes racks the manufacturer classifies as folding wall racks.",
    matches: (product) => product.rack_specs?.rack_type === "folding-wall",
  },
  {
    slug: "compact-power-racks",
    title: "Compact power racks",
    summary: "Freestanding racks built for a smaller room.",
    criteria: "Includes racks the manufacturer classifies as compact power racks.",
    matches: (product) => product.rack_specs?.rack_type === "compact-power-rack",
  },
  {
    slug: "half-racks",
    title: "Half racks",
    summary: "Half racks with a smaller footprint than a full power rack.",
    criteria: "Includes racks the manufacturer classifies as half racks.",
    matches: (product) => product.rack_specs?.rack_type === "half-rack",
  },
  {
    slug: "squat-stands",
    title: "Squat stands",
    summary: "Stands you can move when the workout is over.",
    criteria: "Includes racks the manufacturer classifies as squat stands.",
    matches: (product) => product.rack_specs?.rack_type === "squat-stand",
  },
];

export function getFitPreset(slug: string): FitPreset | undefined {
  return fitPresets.find((preset) => preset.slug === slug);
}
