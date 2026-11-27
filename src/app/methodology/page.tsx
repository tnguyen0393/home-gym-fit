import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Methodology",
  "How product dimensions are recorded and how missing values are shown.",
  "/methodology/",
);

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
        A bench card prints Not published when type, vertical storage, capacity, unit weight, or
        stored footprint has no manufacturer value. One Unverified badge covers the other gaps. The
        product page names those gaps in plain language. Stored height, stored width, stored depth,
        and folded depth stay unverified until the manufacturer prints them.
      </p>
      <p>
        An adjustable dumbbell card and the compare drawer print Not published when a dumbbell spec
        is null. The product page prints Unverified for that same null. A published no, such as no
        tray or not expandable, stays No. Tray length, width, and height are also shown together
        when the manufacturer publishes all three.
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
