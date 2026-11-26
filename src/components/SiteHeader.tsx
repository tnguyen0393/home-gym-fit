import Link from "next/link";

const links = [
  { href: "/directory/", label: "Directory" },
  { href: "/guides/", label: "Guides" },
  { href: "/compare/", label: "Compare" },
  { href: "/methodology/", label: "Methodology" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="h-1 bg-indigo-800" />
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight text-stone-950">
          Home Gym Fit
        </Link>
        <nav aria-label="Primary" className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-indigo-800 underline decoration-indigo-200 underline-offset-4 hover:decoration-indigo-800"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
