import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "What Home Gym Fit publishes and who maintains the records.",
  alternates: { canonical: "/about/" },
};

export default function AboutPage() {
  return (
    <article className="flex max-w-3xl flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>
      <p>
        Home Gym Fit is Tien Nguyen&apos;s directory of manufacturer-verified dimensions for compact
        and folding squat racks, power racks, and short rackable barbells.
      </p>
      <p>
        Spec Steward records values from official manufacturer spec sheets in data/products.json.
        Guide & Comparison Editor publishes guides and comparisons as files under content/guides and
        content/compare. This site does not rank products and does not fill in measurements a
        manufacturer left unpublished.
      </p>
    </article>
  );
}
