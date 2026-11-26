import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "What Home Gym Fit publishes and who maintains the records.",
  alternates: { canonical: "/about/" },
};

export default function AboutPage() {
  return (
    <article className="legal-copy flex max-w-prose flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>
      <p>
        Home Gym Fit is Tien Nguyen&apos;s directory of manufacturer-published dimensions for compact
        and folding squat racks, power racks, short rackable barbells, and benches that store
        upright.
      </p>
      <p>
        Measurements come from official manufacturer spec sheets. Guides and comparisons are written
        from those same sheets. This site does not rank products and does not fill in a measurement
        the manufacturer left unpublished.
      </p>
    </article>
  );
}
