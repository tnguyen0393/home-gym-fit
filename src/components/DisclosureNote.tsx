export function DisclosureNote({
  includeAmazonStatement = false,
}: {
  includeAmazonStatement?: boolean;
}) {
  return (
    <aside className="rounded-md bg-stone-100 px-3 py-2 text-sm leading-5 text-stone-600">
      <p>
        Affiliate links may earn us a commission at no extra cost to you. We do not publish prices,
        stock, or ratings.
        {includeAmazonStatement
          ? " As an Amazon Associate I earn from qualifying purchases."
          : null}{" "}
        <a className="font-medium text-indigo-800 underline" href="/disclosure/">
          Full disclosure
        </a>
        .
      </p>
    </aside>
  );
}
