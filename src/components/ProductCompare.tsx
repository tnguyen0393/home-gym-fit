import Link from "next/link";
import { cardSpecCells, compareExtraCells, type SpecCell } from "@/lib/format";
import type { GymProduct } from "@/lib/types";
import { SpecValue } from "@/components/SpecTable";

function compareRows(products: GymProduct[]): { label: string; values: SpecCell[] }[] {
  const labels: string[] = [];
  const columns = products.map((product) => {
    const cells = [...cardSpecCells(product), ...compareExtraCells(product)];
    for (const cell of cells) {
      if (!labels.includes(cell.label)) labels.push(cell.label);
    }
    return cells;
  });

  return labels.map((label) => ({
    label,
    values: columns.map(
      (cells) => cells.find((cell) => cell.label === label) ?? { label, value: "N/A" },
    ),
  }));
}

export function ProductCompare({ products }: { products: GymProduct[] }) {
  const rows = compareRows(products);

  return (
    <div id="compare-panel" className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <caption className="px-3 py-2 text-left text-sm text-stone-600">
          Published specs for the selected products.
        </caption>
        <thead>
          <tr className="border-t border-stone-200">
            <th scope="col" className="px-3 py-2 text-left font-medium text-stone-500">
              Spec
            </th>
            {products.map((product) => (
              <th key={product.id} scope="col" className="px-3 py-2 text-left font-semibold">
                <Link href={`/products/${product.slug}/`} className="text-indigo-800 hover:underline">
                  {product.brand} {product.model}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-stone-200">
              <th scope="row" className="px-3 py-2 text-left font-medium text-stone-600">
                {row.label}
              </th>
              {row.values.map((cell, index) => (
                <td key={products[index].id} className="px-3 py-2">
                  <SpecValue value={cell.value} hint={cell.hint} badge />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
