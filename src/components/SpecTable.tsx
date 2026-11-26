import type { SpecRow } from "@/lib/format";

export function SpecTable({ rows }: { rows: SpecRow[] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-t border-stone-200">
            <th scope="row" className="w-2/5 py-2 pr-3 text-left font-medium text-stone-600">
              {row.label}
            </th>
            <td className="py-2">
              <SpecValue value={row.value} hint={row.hint} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SpecValue({
  value,
  hint,
  badge = false,
}: {
  value: string;
  hint?: string;
  badge?: boolean;
}) {
  if (value === "Unverified") {
    const tip = hint ?? "The manufacturer has not published this value.";
    return (
      <span
        className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-950"
        title={tip}
      >
        Unverified
        <span aria-hidden="true">?</span>
        <span className="sr-only">. {tip}</span>
      </span>
    );
  }
  if (value === "N/A" || value === "Not published") {
    return <span className="text-sm text-stone-500">{value}</span>;
  }
  if (badge) {
    return (
      <span className="inline-block rounded bg-stone-100 px-1.5 py-0.5 text-sm font-medium tabular-nums text-stone-950">
        {value}
      </span>
    );
  }
  return <span className="tabular-nums">{value}</span>;
}
