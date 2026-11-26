import Link from "next/link";

const links = [
  { href: "/directory/", label: "Directory" },
  { href: "/guides/", label: "Guides" },
  { href: "/compare/", label: "Compare" },
  { href: "/methodology/", label: "Methodology" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-stone-300 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Home Gym Fit
        </Link>
        <nav aria-label="Primary" className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="underline decoration-stone-300">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
