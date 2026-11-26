import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclosure",
  description: "Affiliate disclosure for manufacturer and Amazon links.",
  alternates: { canonical: "/disclosure/" },
};

export default function DisclosurePage() {
  return (
    <article className="flex max-w-3xl flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Disclosure</h1>
      <p>
        Some outbound links are affiliate links. If you buy through one, we may earn a commission
        at no extra cost to you. As an Amazon Associate I earn from qualifying purchases.
      </p>
      <p>
        Purchase links are direct. This site does not use /go/ cloaking or URL shorteners. Affiliate
        links use rel=&quot;sponsored nofollow noopener noreferrer&quot; and open in a new tab.
      </p>
      <p>
        When a product has rep_affiliate_eligible set and both NEXT_PUBLIC_REP_AFFILIATE_PARAM and
        NEXT_PUBLIC_REP_AFFILIATE_VALUE are configured at build time, those query parameters are
        appended to the manufacturer URL. If either value is unset, the link is the plain
        manufacturer_url.
      </p>
      <p>
        When a product has an Amazon ASIN and NEXT_PUBLIC_AMAZON_TAG is set, the Amazon link is
        https://www.amazon.com/dp/ASIN?tag=TAG using that ASIN and tag. If either is missing, no
        Amazon link is rendered. Amazon prices, stock, and ratings are not hardcoded and are not
        stored.
      </p>
      <p>
        Official spec sheet links are source citations. They do not receive affiliate parameters.
      </p>
    </article>
  );
}
