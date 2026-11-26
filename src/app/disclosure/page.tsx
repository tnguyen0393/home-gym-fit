import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclosure",
  description: "Affiliate disclosure for manufacturer and Amazon links.",
  alternates: { canonical: "/disclosure/" },
};

export default function DisclosurePage() {
  return (
    <article className="legal-copy flex max-w-prose flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Disclosure</h1>
      <p>
        Some outbound links are affiliate links. If you buy through one, we may earn a commission at
        no extra cost to you. As an Amazon Associate I earn from qualifying purchases.
      </p>
      <p>
        Purchase links go directly to the retailer. This site does not cloak links or use URL
        shorteners. Affiliate links use rel=&quot;sponsored nofollow noopener noreferrer&quot; and
        open in a new tab.
      </p>
      <p>
        Manufacturer links stay as the brand published them. When an affiliate code is configured
        for an eligible product, that code is added to the manufacturer link. If it is not
        configured, the link is the plain manufacturer page.
      </p>
      <p>
        An Amazon link appears only when a product has an Amazon product code and an Associates tag
        is configured. The link uses that product code and tag. If either is missing, no Amazon link
        is shown. Amazon prices, stock, and ratings are not stored and are not displayed.
      </p>
      <p>Official spec sheet links are source citations. They do not receive affiliate parameters.</p>
    </article>
  );
}
