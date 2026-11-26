import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How product dimensions are recorded and how missing values are shown.",
  alternates: { canonical: "/methodology/" },
};

export default function MethodologyPage() {
  return (
    <article className="legal-copy flex max-w-prose flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Methodology</h1>
      <p>
        Each product page lists only values the manufacturer published, plus the spec sheet link and
        the date those values were last checked. A measurement the source does not state is left
        blank and labeled Unverified.
      </p>
      <p>
        Folded depth and fold direction are labeled N/A when the product does not fold. A barbell
        with no installation record is labeled N/A for installation, not given a guessed mount.
      </p>
      <p>
        Minimum ceiling is shown only when the manufacturer states one. The directory ceiling filter
        uses that stated minimum when it exists. Otherwise it compares the upright height, and the
        product card marks the minimum ceiling as unverified. Upright height is not turned into a
        clearance requirement, and no inches are added.
      </p>
      <p>
        Each fit preset page states its inclusion rule. The product page lists the fields that could
        not be confirmed. Prices, stock, and ratings are not stored and are not displayed.
      </p>
    </article>
  );
}
