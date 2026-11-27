import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Privacy",
  "What this static site does and does not collect.",
  "/privacy/",
);

export default function PrivacyPage() {
  return (
    <article className="legal-copy flex max-w-prose flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
      <p>
        Home Gym Fit is a static site hosted on Cloudflare Pages. It has no accounts and no
        first-party analytics scripts. Pages do not ask for personal information.
      </p>
      <p>
        Outbound links go directly to the manufacturer or, when an Associates link is configured, to
        Amazon. Those sites have their own privacy practices. Cloudflare may process request logs as
        the host. This site does not sell personal information.
      </p>
    </article>
  );
}
