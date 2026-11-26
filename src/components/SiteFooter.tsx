import Link from "next/link";

const links = [
  { href: "/about/", label: "About" },
  { href: "/methodology/", label: "Methodology" },
  { href: "/disclosure/", label: "Disclosure" },
  { href: "/privacy/", label: "Privacy" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-stone-300 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-stone-700">
        <p>
          Some outbound links are affiliate links.{" "}
          <Link href="/disclosure/" className="underline">
            Affiliate disclosure
          </Link>
          .
        </p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="underline">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
