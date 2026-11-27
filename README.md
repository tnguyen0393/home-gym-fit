# Home Gym Fit

Static directory of manufacturer-verified compact and folding racks, short rackable barbells, vertical-storage benches, and adjustable dumbbells. Built with Next.js App Router, TypeScript strict mode, and Tailwind CSS. The production build is a static export for Cloudflare Pages.

## Cloudflare Pages

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `out` |
| Node | 22 |

`next.config.ts` sets `output: "export"`, `trailingSlash: true`, and `images: { unoptimized: true }`. Deploy the `out/` directory as static files. Do not attach a Node server adapter.

Set these environment variables before the build. `NEXT_PUBLIC_*` values are inlined at build time.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for `metadataBase`, the sitemap, and JSON-LD. No trailing slash. Defaults to `https://home-gym-fit.pages.dev`. |
| `NEXT_PUBLIC_REP_AFFILIATE_PARAM` | Query parameter name appended to a REP Fitness manufacturer URL. |
| `NEXT_PUBLIC_REP_AFFILIATE_VALUE` | Query parameter value. Both REP variables must be non-empty, and the product must have `affiliates.rep_affiliate_eligible: true`. Otherwise the link is the plain `manufacturer_url`. |
| `NEXT_PUBLIC_AMAZON_TAG` | Amazon Associates tag. A product renders `https://www.amazon.com/dp/${amazon_asin}?tag=${NEXT_PUBLIC_AMAZON_TAG}` only when both the ASIN and the tag are present. |

See `.env.example`.

## Routes

Trailing slashes are part of the exported paths (`out/about/index.html` serves `/about/`).

- `/` catalog counts derived from `data/products.json`, plus links to fit presets. The vertical-storage bench card links to `/directory/?category=bench&vertical=1`. The adjustable dumbbell card links to `/directory/?category=dumbbell`
- `/directory/` client-side fit filters over the same file, including Benches and Dumbbells categories, a Vertical storage chip, and Tray included / Expandable chips
- `/fit/<slug>/` preset pages from `generateStaticParams`
- `/products/<slug>/` one static page per product
- `/guides/` and `/guides/<slug>/` Markdown from `content/guides/`
- `/compare/` and `/compare/<slug>/` Markdown from `content/compare/`
- `/about/`, `/methodology/`, `/disclosure/`, `/privacy/`

Fit preset slugs: `under-8-foot-ceiling`, `under-84-inch-ceiling`, `renter-friendly-no-wall-mount`, `folding-wall-racks`, `compact-power-racks`, `half-racks`, `squat-stands`.

`/sitemap.xml` and `/robots.txt` are generated with `export const dynamic = "force-static"`.

JSON-LD is an `ItemList` on `/directory/` and each `/fit/<slug>/`, and a `Product` on `/products/<slug>/`. Product JSON-LD has no `offers` and no `aggregateRating`.

## Data contract (Spec Steward)

Canonical file: `data/products.json`. Copy records in full. Do not invent dimensions, weights, URLs, or dates.

`npm run validate:data` checks the file before a release:

- The root is an array of objects with the known keys only.
- `category` is `rack`, `bench`, `barbell`, or `dumbbell`.
- Racks require `dimensions`, `installation`, and `rack_specs`.
- Barbells require `barbell_specs`. `installation` may be omitted or null.
- Benches require `dimensions` and `bench_specs`. `installation`, `rack_specs`, `barbell_specs`, and `dumbbell_specs` are omitted.
- Dumbbells require `dimensions` and `dumbbell_specs`. `installation`, `rack_specs`, `barbell_specs`, and `bench_specs` are omitted.
- `bench_specs` is fourteen flat scalars, each nullable: `bench_type` (`adjustable`, `flat`, or null), `vertical_storage`, `stored_height_in`, `stored_width_in`, `stored_depth_in`, `stored_footprint_sqft`, `pad_width_in`, `pad_thickness_in`, `pad_gap_in`, `back_pad_positions`, `seat_pad_positions`, `decline_capable`, `weight_capacity_lbs`, `transport_wheels`.
- When `stored_height_in`, `stored_width_in`, `stored_depth_in`, or `dimensions.depth_folded_in` is null on a bench, that path is listed in `verification.unverified_fields`. A published number is not listed there.
- `dumbbell_specs` is thirteen flat scalars, each nullable: `min_weight_lbs`, `max_weight_lbs`, `weight_increment_lbs`, `adjustment_mechanism` (`selector-pin`, `twist-handle`, `lock-switch`, `quick-lock-screw`, `dial`, or null), `handle_diameter_mm`, `handle_length_in`, `tray_included`, `tray_length_in`, `tray_width_in`, `tray_height_in`, `stand_included`, `expandable`, `sold_as` (`pair`, `single`, or null).
- `installation.fold_direction` is `inward`, `outward`, `upward`, `none`, or null.
- Official URLs (`spec_sheet_url`, `additional_source_urls`, `manufacturer_url`) are `https`.
- No price, stock, or rating keys anywhere in the document.
- `id` and `slug` are unique.

Null means the manufacturer did not publish that value. Rack and barbell pages print `Unverified`. A bench card prints `Not published` for a null strip value and one Unverified badge for the other gaps. The bench product page prints `Unverified` for a listed gap and `N/A` when a field does not apply. A dumbbell card and the compare drawer print `Not published` for a null dumbbell spec. The dumbbell product page prints `Unverified` for that null, and `No` only when the manufacturer published false. Tray length, width, and height are also shown as one size when all three are published. Folded depth and fold direction print `N/A` when `fold_direction` is `none`. The UI does not compute a ceiling clearance from upright height. The directory ceiling filter applies to racks: it uses `min_ceiling_in` when it is a number, and otherwise the published `height_in`, and the card says the minimum ceiling is unverified. Bench pad height is not treated as a ceiling.

`BarbellSpecs` fields, each nullable: `overall_length_in`, `shaft_length_in`, `loadable_sleeve_length_in`, `shaft_diameter_mm`, `sleeve_diameter_in`, `tensile_strength_psi`, `weight_capacity_lbs`, `knurl_marks`, `center_knurl`, `bushing_or_bearing`, `coating`, `rackable`. `center_knurl` and `rackable` are booleans or null. `knurl_marks`, `bushing_or_bearing`, and `coating` are strings or null.

The directory category filter includes racks, barbells, benches, and dumbbells. Max bar length compares `overall_length_in` and does not hide racks, benches, or dumbbells. Vertical storage keeps benches with `bench_specs.vertical_storage: true`. Tray included keeps dumbbells with `dumbbell_specs.tray_included: true`. Expandable keeps dumbbells with `dumbbell_specs.expandable: true`. A null does not pass either dumbbell chip.

## Content contract (Guide & Comparison Editor)

Drop `.md` or `.mdx` files into `content/guides/` and `content/compare/` and rebuild. Bodies are parsed as Markdown with `gray-matter`, `remark`, `remark-gfm`, and a sanitize step. JSX in `.mdx` is not executed. Do not rewrite published editorial files in app code.

Frontmatter:

```yaml
title: string
description: string
slug: string          # must match the filename, without .md or .mdx
type: guide           # guide or explainer in content/guides; compare in content/compare
publishedAt: YYYY-MM-DD
updatedAt: YYYY-MM-DD
productIds: []        # GymProduct.id values, or an empty array
constraintTags: []    # optional
lastVerifiedDate: YYYY-MM-DD  # optional
testingStatus: string # optional
ftcDisclosure: false  # optional
```

Explainers live in `content/guides/` and render at `/guides/<slug>/`. The article page shows the FTC disclosure when `ftcDisclosure` is true or `productIds` is non-empty. Bodies are GitHub-flavored Markdown, so tables in `.mdx` render as tables. JSX is not executed.

Published pages:

- `content/guides/folding-power-racks-8-foot-ceiling.mdx` → `/guides/folding-power-racks-8-foot-ceiling/`
- `content/guides/best-short-olympic-barbells.mdx` → `/guides/best-short-olympic-barbells/`
- `content/guides/best-vertical-storage-weight-benches.mdx` → `/guides/best-vertical-storage-weight-benches/`
- `content/guides/best-adjustable-dumbbells-for-apartments.mdx` → `/guides/best-adjustable-dumbbells-for-apartments/`
- `content/guides/renter-friendly-squat-racks.mdx` → `/guides/renter-friendly-squat-racks/`
- `content/compare/rep-pr-4100-vs-rogue-rml-3w.mdx` → `/compare/rep-pr-4100-vs-rogue-rml-3w/`
- `content/compare/prx-profile-vs-rep-pr-4100.mdx` → `/compare/prx-profile-vs-rep-pr-4100/`

## Scripts

```bash
npm run validate:data
npx tsc --noEmit
npm run lint
npm run build
```

`npm run build` writes the static site to `out/`.

## Affiliate links

Outbound affiliate URLs are the real retailer URLs. There is no `/go/` redirect. Affiliate anchors set `rel="sponsored nofollow noopener noreferrer"` and `target="_blank"`. The disclosure note sits next to those links, and `/disclosure/` includes: As an Amazon Associate I earn from qualifying purchases.
