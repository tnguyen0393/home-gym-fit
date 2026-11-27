import type { ArticleType, ProductCategory } from "@/lib/types";

export interface ArtworkAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const heroArt: ArtworkAsset = {
  src: "/images/hero-apartment-gym.svg",
  alt: "Apartment wall bay with a folded rack under a 96 inch ceiling, a short barbell, a bench stored upright, and dumbbells on a cradle.",
  width: 880,
  height: 500,
};

export const categoryArt: Record<
  ProductCategory,
  ArtworkAsset & { label: string; href: string; summary: string }
> = {
  rack: {
    src: "/images/category-racks.svg",
    alt: "Folding wall rack drawn against a wall under a ceiling line.",
    width: 320,
    height: 220,
    label: "Racks",
    href: "/directory/?category=rack",
    summary: "Published height, ceiling, and depth for folding and freestanding racks.",
  },
  barbell: {
    src: "/images/category-barbells.svg",
    alt: "Short barbell drawn inside the length of a standard Olympic bar.",
    width: 320,
    height: 220,
    label: "Short barbells",
    href: "/directory/?category=barbell",
    summary: "Rackable bars compared with an 86.6 in Olympic bar.",
  },
  bench: {
    src: "/images/category-benches.svg",
    alt: "Weight bench stored upright beside a faint in-use outline.",
    width: 320,
    height: 220,
    label: "Vertical benches",
    href: "/directory/?category=bench&vertical=1",
    summary: "Benches that store upright. Stored size stays blank when it was not printed.",
  },
  dumbbell: {
    src: "/images/category-dumbbells.svg",
    alt: "Adjustable dumbbells resting in a cradle.",
    width: 320,
    height: 220,
    label: "Adjustable dumbbells",
    href: "/directory/?category=dumbbell",
    summary: "Published weight range, max length, and tray when the manufacturer prints one.",
  },
};

export const categoryBlurbs: Record<ProductCategory, string> = {
  rack: "Ceiling and wall-depth diagrams use published measurements. A missing minimum ceiling stays blank.",
  barbell: "Length is the published overall length, set against an 86.6 in Olympic bar.",
  bench: "Outlines use published length and width. Stored size and footprint appear only when printed.",
  dumbbell: "Weight bars use the published range on a 0–125 lb scale. Tray size appears only when printed.",
};

/**
 * Picks a guide header illustration from tags, slug, and title.
 * Does not read or rewrite the article body.
 */
export function guideArtwork(article: {
  type: ArticleType;
  slug: string;
  title: string;
  constraintTags?: string[];
}, categories: ProductCategory[]): ArtworkAsset | null {
  if (article.type === "compare") return null;
  const tags = (article.constraintTags ?? []).join(" ");
  const haystack = `${article.slug} ${article.title} ${tags}`.toLowerCase();
  const category = categoryFromText(haystack) ?? soleCategory(categories);
  return category ? categoryArt[category] : null;
}

function categoryFromText(haystack: string): ProductCategory | null {
  if (haystack.includes("dumbbell")) return "dumbbell";
  if (haystack.includes("barbell") || haystack.includes("olympic")) return "barbell";
  if (haystack.includes("bench")) return "bench";
  if (
    haystack.includes("rack") ||
    haystack.includes("squat") ||
    haystack.includes("ceiling") ||
    haystack.includes("renter")
  ) {
    return "rack";
  }
  return null;
}

function soleCategory(categories: ProductCategory[]): ProductCategory | null {
  const unique = new Set(categories);
  if (unique.size !== 1) return null;
  return [...unique][0] ?? null;
}
