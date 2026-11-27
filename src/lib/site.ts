import type { Metadata } from "next";

const DEFAULT_SITE_URL = "https://home-gym-fit.pages.dev";

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return DEFAULT_SITE_URL;
  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute http(s) URL");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute http(s) URL");
  }
  return url.origin;
}

export const ogImage = {
  url: "/images/og.png",
  width: 1200,
  height: 630,
  alt: "Apartment wall bay with a folded rack, a short barbell, an upright bench, and dumbbells.",
} as const;

/** Shared title, canonical, Open Graph, and Twitter tags for one route. */
export function pageMetadata(title: string, description: string, path: string): Metadata {
  const fullTitle = path === "/" ? title : `${title} · Home Gym Fit`;
  const socialTitle = { absolute: fullTitle };
  return {
    title: socialTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      type: "website",
      siteName: "Home Gym Fit",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [ogImage.url],
    },
  };
}
