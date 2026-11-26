import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How product dimensions are recorded and how missing values are shown.",
  alternates: { canonical: "/methodology/" },
};

export default function MethodologyPage() {
  return (
    <article className="flex max-w-3xl flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Methodology</h1>
      <p>
        Each product record stores only values published by the manufacturer. The spec sheet URL and
        last verified date are shown on the product page. Fields the source does not state are null.
      </p>
      <p>
        Null measurements are labeled Unverified. Folded depth and fold direction are labeled N/A
        when the product does not fold (fold_direction is none). A barbell with no installation
        record is labeled N/A for installation, not given a guessed mount.
      </p>
      <p>
        Minimum ceiling is shown only when min_ceiling_in is published. The directory ceiling filter
        uses that stated minimum when it exists, and otherwise compares the upright height. The card
        says so. Upright height is not converted into a clearance requirement, and no inches are
        added.
      </p>
      <p>
        Fit pages state their inclusion rule in the page text. verification.unverified_fields lists
        what Spec Steward could not confirm. The catalog validator rejects price, stock, and rating
        keys. Those values are not stored and not displayed.
      </p>
    </article>
  );
}
