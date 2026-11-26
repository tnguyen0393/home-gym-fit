export function DisclosureNote({
  includeAmazonStatement = false,
}: {
  includeAmazonStatement?: boolean;
}) {
  return (
    <aside className="border border-stone-300 bg-stone-100 px-3 py-2 text-sm leading-6 text-stone-700">
      <p>
        Disclosure: some outbound links are affiliate links. We may earn a commission if you buy
        through them, at no extra cost to you. Links go directly to the retailer. This site does
        not publish prices, stock, or ratings.
        {includeAmazonStatement
          ? " As an Amazon Associate I earn from qualifying purchases."
          : null}{" "}
        <a className="underline" href="/disclosure/">
          Full disclosure
        </a>
        .
      </p>
    </aside>
  );
}
