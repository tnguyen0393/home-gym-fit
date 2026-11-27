import { amazonLink, manufacturerLink } from "@/lib/affiliates";
import type { GymProduct } from "@/lib/types";
import { OutboundLink } from "@/components/OutboundLink";
import { pillLinkClass } from "@/components/styles";

export function ProductLinks({ product }: { product: GymProduct }) {
  const manufacturer = manufacturerLink(product);
  const amazon = amazonLink(product);

  return (
    <div className="flex flex-wrap gap-2">
      <OutboundLink href={manufacturer.href} affiliate={manufacturer.affiliate} className={pillLinkClass}>
        {manufacturer.affiliate ? "Manufacturer page · Affiliate" : "Manufacturer page"}
        <span aria-hidden="true">↗</span>
      </OutboundLink>
      {amazon ? (
        <OutboundLink href={amazon.href} affiliate={amazon.affiliate} className={pillLinkClass}>
          {amazon.affiliate ? "Amazon · Affiliate" : "Amazon"}
          <span aria-hidden="true">↗</span>
        </OutboundLink>
      ) : null}
      <OutboundLink href={product.verification.spec_sheet_url} affiliate={false} className={pillLinkClass}>
        Official spec sheet
        <span aria-hidden="true">↗</span>
      </OutboundLink>
    </div>
  );
}
