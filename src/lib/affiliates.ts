import type { GymProduct } from "@/lib/types";

export interface OutboundTarget {
  href: string;
  affiliate: boolean;
}

/**
 * REP affiliate parameters are appended only when the product is eligible and
 * both public env vars are set. Otherwise the plain manufacturer URL is used.
 */
export function manufacturerLink(product: GymProduct): OutboundTarget {
  const plain = product.affiliates.manufacturer_url;
  if (!product.affiliates.rep_affiliate_eligible) {
    return { href: plain, affiliate: false };
  }
  const param = process.env.NEXT_PUBLIC_REP_AFFILIATE_PARAM?.trim();
  const value = process.env.NEXT_PUBLIC_REP_AFFILIATE_VALUE?.trim();
  if (!param || !value) return { href: plain, affiliate: false };
  try {
    const url = new URL(plain);
    url.searchParams.set(param, value);
    return { href: url.toString(), affiliate: true };
  } catch {
    return { href: plain, affiliate: false };
  }
}

/** Direct Amazon Associates URL. Null when the ASIN or tag is absent. */
export function amazonLink(product: GymProduct): string | null {
  const asin = product.affiliates.amazon_asin;
  const tag = process.env.NEXT_PUBLIC_AMAZON_TAG?.trim();
  if (!asin || !tag) return null;
  return `https://www.amazon.com/dp/${encodeURIComponent(asin)}?tag=${encodeURIComponent(tag)}`;
}
