import { amazonLink, manufacturerLink } from "@/lib/affiliates";
import type { GymProduct } from "@/lib/types";
import { DisclosureNote } from "@/components/DisclosureNote";
import { OutboundLink } from "@/components/OutboundLink";

export function ProductLinks({ product }: { product: GymProduct }) {
  const manufacturer = manufacturerLink(product);
  const amazon = amazonLink(product);
  const affiliate = manufacturer.affiliate || amazon != null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <OutboundLink href={manufacturer.href} affiliate={manufacturer.affiliate}>
          <span className="underline">
            {manufacturer.affiliate ? "Manufacturer page (affiliate)" : "Manufacturer page"}
          </span>
        </OutboundLink>
        {amazon ? (
          <OutboundLink href={amazon} affiliate>
            <span className="underline">Amazon (affiliate)</span>
          </OutboundLink>
        ) : null}
        <OutboundLink href={product.verification.spec_sheet_url} affiliate={false}>
          <span className="underline">Official spec sheet</span>
        </OutboundLink>
      </div>
      {affiliate ? <DisclosureNote includeAmazonStatement={amazon != null} /> : null}
    </div>
  );
}
