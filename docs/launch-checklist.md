# Launch checklist

Do these yourself. `NEXT_PUBLIC_*` values are inlined at build time. Nothing secret belongs in the repo.

## 1. Cloudflare Pages environment variables

Project `home-gym-fit` → Settings → Environment variables. Set them for Production, and for Preview if preview builds should match.

- `NEXT_PUBLIC_SITE_URL` — canonical origin, no trailing slash. Use `https://home-gym-fit.pages.dev` until a custom domain exists.
- `NEXT_PUBLIC_GSC_VERIFICATION` — the Google site-verification meta tag content.
- `NEXT_PUBLIC_AMAZON_TAG` — after Associates approval.
- `NEXT_PUBLIC_REP_AFFILIATE_PARAMS` — after REP approval. Query string only, for example `ref=xyz`.

Redeploy after any change. Docs: https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables

## 2. Google Search Console

- Add a URL-prefix property for `https://home-gym-fit.pages.dev` and verify with the meta tag above, or add a Domain property with a DNS TXT record once a custom domain exists.
- Submit `https://home-gym-fit.pages.dev/sitemap.xml`.
- Request indexing for the home page and `/directory/`.

## 3. Amazon Associates

- Apply for Amazon Associates.
- The account must refer 3 qualifying sales within 180 days of signup, or Amazon closes the application.
- Amazon links appear only after Spec Steward sets `affiliates.amazon_asin`. The tag is appended only when `NEXT_PUBLIC_AMAZON_TAG` is set.

## 4. REP Fitness affiliate program

- Apply to the REP Fitness affiliate program.
- Copy the query-string format from the REP dashboard into `NEXT_PUBLIC_REP_AFFILIATE_PARAMS`.
- Those parameters are added only on `repfitness.com` links for products with `rep_affiliate_eligible: true`.

## 5. Post-launch spot checks

- View source on a REP product page: an eligible `repfitness.com` link includes the parameter and `rel="sponsored nofollow noopener noreferrer"`. Other retailer links do not gain that parameter.
- Confirm no Amazon link until an ASIN is filled, and exactly one disclosure bar on directory, fit, guide, and product pages.
- Confirm the Search Console meta tag when `NEXT_PUBLIC_GSC_VERIFICATION` is set.
- Run a product page and the directory through the Rich Results Test.
- Fetch `/robots.txt` and `/sitemap.xml` and confirm the sitemap host matches `NEXT_PUBLIC_SITE_URL`.
