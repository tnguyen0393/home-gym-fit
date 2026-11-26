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
            <td className="py-2 tabular-nums">
              <SpecValue value={row.value} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SpecValue({ value }: { value: string }) {
  if (value === "Unverified") return <span className="text-amber-800">Unverified</span>;
  if (value === "N/A") return <span className="text-stone-500">N/A</span>;
  return value;
}
