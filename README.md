# SAI-commerce-frontend

This is official repository of Spectrum Audio Instruments e-commerce frontend.

However this same project may be reused and customized for any project, using shopify storefront API or other e-commerce backend.

Project architecture is inspired by clean architectural desgin. UI components and routes being content/data source agnostic. Data is coming form mock data or shopify storefront API.

## Structure

- `app/` Next.js application
- `docs/` project notes and planning docs
- `design-prototype/` early design material

The active system overview is in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
The original Hydrogen/Oxygen plan is retained only as project history.

## Data

- data source is selected with `NEXT_PUBLIC_DATA_SOURCE`
- supported values: `mock` or `shopify`
- Shopify content is loaded through Storefront API
- shared Shopify metaobject constants live in `app/src/data/shopify/metaobjects.ts`

## Main Shopify content

- `shared_brand_data`
- `shared_contact_data`
- `home_page`
- `products_page`
- `product_details_page`

## Env

Set these in `app/` env files:

```env
NEXT_PUBLIC_DATA_SOURCE=mock|shopify
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
SHOPIFY_STORE_DOMAIN=
SHOPIFY_STOREFRONT_API_VERSION=
SHOPIFY_STOREFRONT_PUBLIC_TOKEN=
```

No separate shop ID, storefront ID, Customer Account API credential, Admin API
token, or analytics token is required. The server resolves Shopify's shop GID
and the configured checkout host through the existing Storefront API connection.
The public Storefront token is also used by Shopify's Customer Privacy API as
required for a custom storefront.

For Headless channel setup, Storefront API configuration, deployment values,
checkout acceptance, and credential rotation, read
[`docs/SHOPIFY-COMMERCE-SETUP.md`](docs/SHOPIFY-COMMERCE-SETUP.md).

## Commands

```bash
cd app
npm run dev
npm run lint
npm run build
```
