import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Disclosure",
  "Affiliate disclosure for Amazon Associates and REP Fitness links.",
  "/disclosure/",
);

export default function DisclosurePage() {
  return (
    <article className="legal-copy flex max-w-prose flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Disclosure</h1>
      <p>
        Some outbound links are affiliate links. If you buy through one, we may earn a commission at
        no extra cost to you. As an Amazon Associate I earn from qualifying purchases. Home Gym Fit
        also participates in the REP Fitness affiliate program.
      </p>
      <p>
        Purchase links go directly to the retailer. This site does not cloak links or use URL
        shorteners. Affiliate links use rel=&quot;sponsored nofollow noopener noreferrer&quot; and
        open in a new tab.
      </p>
      <p>
        A REP Fitness link keeps the manufacturer URL. When an affiliate query string is configured,
        it is added only on repfitness.com for an eligible product, and it does not replace
        parameters already on the link. Other manufacturer links stay as published.
      </p>
      <p>
        An Amazon link appears only when a product has an Amazon product code. The Associates tag is
        added when it is configured. If the product code is missing, no Amazon link is shown. Amazon
        prices, stock, and ratings are not stored and are not displayed.
      </p>
      <p>Official spec sheet links are source citations. They do not receive affiliate parameters.</p>
    </article>
  );
}
