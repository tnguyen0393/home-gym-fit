import type { GymProduct } from "@/lib/types";

export interface OutboundTarget {
  href: string;
  affiliate: boolean;
}

const REP_HOSTS = new Set(["repfitness.com", "www.repfitness.com"]);

/**
 * REP Fitness affiliate query string from NEXT_PUBLIC_REP_AFFILIATE_PARAMS.
 * The exact fragment (for example `ref=xyz`) comes from the REP affiliate
 * dashboard after approval. It is merged onto eligible repfitness.com links
 * and does not replace query parameters already on the URL.
 */
function repAffiliateParams(): URLSearchParams | null {
  const raw = process.env.NEXT_PUBLIC_REP_AFFILIATE_PARAMS?.trim();
  if (!raw) return null;
  const parsed = new URLSearchParams(raw.replace(/^[?#]+/, ""));
  const params = new URLSearchParams();
  parsed.forEach((value, key) => {
    if (key) params.append(key, value);
  });
  return params.size > 0 ? params : null;
}

function appendRepParams(plain: string, eligible: boolean): OutboundTarget {
  if (!eligible) return { href: plain, affiliate: false };
  const extra = repAffiliateParams();
  if (!extra) return { href: plain, affiliate: false };
  let url: URL;
  try {
    url = new URL(plain);
  } catch {
    return { href: plain, affiliate: false };
  }
  if (!REP_HOSTS.has(url.hostname)) return { href: plain, affiliate: false };
  let applied = false;
  extra.forEach((value, key) => {
    if (url.searchParams.has(key)) return;
    url.searchParams.append(key, value);
    applied = true;
  });
  if (!applied) return { href: plain, affiliate: false };
  return { href: url.toString(), affiliate: true };
}

function manufacturerKey(href: string): string | null {
  try {
    const url = new URL(href);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    return `${url.hostname}${pathname}`;
  } catch {
    return null;
  }
}

export function manufacturerLink(product: GymProduct): OutboundTarget {
  return appendRepParams(
    product.affiliates.manufacturer_url,
    product.affiliates.rep_affiliate_eligible,
  );
}

/**
 * Rewrites a known manufacturer URL when that product is REP-eligible.
 * Unmatched URLs, including spec sheets, are returned unchanged.
 */
export function manufacturerHref(href: string, products: readonly GymProduct[]): string {
  const key = manufacturerKey(href);
  if (!key) return href;
  const product = products.find((item) => manufacturerKey(item.affiliates.manufacturer_url) === key);
  if (!product) return href;
  return appendRepParams(href, product.affiliates.rep_affiliate_eligible).href;
}

/** Direct Amazon URL when amazon_asin is a non-empty string. Tag is optional. */
export function amazonLink(product: GymProduct): OutboundTarget | null {
  const asin = product.affiliates.amazon_asin?.trim() ?? "";
  if (!asin) return null;
  let url: URL;
  try {
    url = new URL(`https://www.amazon.com/dp/${encodeURIComponent(asin)}`);
  } catch {
    return null;
  }
  const tag = process.env.NEXT_PUBLIC_AMAZON_TAG?.trim();
  if (!tag) return { href: url.toString(), affiliate: false };
  url.searchParams.set("tag", tag);
  return { href: url.toString(), affiliate: true };
}
