# Commerce MVP design

**Status:** Approved  
**Approved:** 2026-08-18

## Outcome

The storefront is MVP-complete when a buyer can add an available Shopify
product to a persistent cart, edit that cart, enter Shopify hosted checkout,
and review merchant-maintained legal policies. Optional tracking must remain
disabled until the buyer gives the relevant consent. Product customization is
not part of this milestone.

## Scope and order

1. Build the Shopify-backed cart and hosted checkout flow.
2. Load Shopify store policies and render them on storefront policy routes.
3. Add consent controls and prevent optional tracking before consent.
4. Complete release verification and broaden automated test coverage.
5. Keep product customization archived until its imagery and business rules
   exist.

Deployment already exists on `main`; this work improves the deployed
storefront rather than selecting a new hosting platform.

## Cart and checkout

Shopify is the source of truth for merchandise identifiers, availability,
prices, currency, quantities, totals, and checkout URLs. A product without
customer-selectable options still uses its Shopify default `ProductVariant` as
the purchasable merchandise.

The product data layer exposes the first available variant's merchandise ID.
The browser sends only merchandise ID and requested quantity to same-origin
Next.js cart endpoints. Those endpoints call Storefront API cart operations and
return normalized application cart data; raw Shopify GraphQL shapes do not
reach UI components.

The Shopify cart ID is stored in an HTTP-only, same-site cookie. The browser
does not read or persist the ID itself. A missing cart is represented as an
empty cart. An expired or invalid Shopify cart clears the cookie and allows a
new cart to be created on the next add operation.

Supported MVP operations are:

- load the current cart;
- create a cart with the first line;
- add another line or increment an existing merchandise line;
- change a line quantity;
- remove a line;
- redirect to the exact `checkoutUrl` returned by Shopify.

Checkout, payment collection, buyer address, shipping selection, taxes, and
order creation remain hosted and owned by Shopify.

## Policies and consent

The merchant authors privacy, refund, shipping, and terms-of-service content in
Shopify Admin under **Settings > Policies**. The storefront reads the native
Storefront API `ShopPolicy` fields and publishes them under
`/policies/[handle]`. The footer and cart/checkout entry point link to all
available policies. An omitted policy is not replaced by mock or invented legal
copy.

Consent is a separate storefront concern. The buyer can accept all optional
uses, reject them, or choose categories. The decision is stored first-party and
can be reopened from the footer. Necessary storage remains active. Analytics
and marketing integrations must use a consent gate and may not initialize
before the corresponding permission is granted. Shopify privacy/consent state
is synchronized through Shopify's supported customer-privacy mechanism chosen
during that phase.

The software presents merchant content and enforces the configured consent
behaviour; it does not claim that generated or merchant-entered text is legal
advice. The merchant owns review of policy content for the markets served.

## Deferred customization

The development-only customization UI remains disabled in production. No
customization selection affects merchandise, price, or checkout in this MVP.
Reactivation requires approved configuration rules, pricing rules, and product
imagery as listed in `docs/BACKLOG.md`.

## Quality and release gates

- Each change is an independently reviewable atomic commit.
- Cart domain and Shopify mapping logic have unit tests.
- Same-origin cart endpoints have integration tests, including invalid and
  expired cart behaviour.
- UI tests cover loading, empty, error, and mutation states.
- E2E tests cover product -> cart -> persisted cart -> Shopify checkout handoff,
  policy navigation, and consent choices.
- CI runs lint, tests, and production build.
- A release checklist verifies a real Shopify test product and test payment
  flow without recording credentials or buyer data.

## Agent context boundaries

Implementation follows the repository `AGENTS.md`. Agent roles are created only
when the work justifies an independent context:

- Shopify/data agent: product merchandise data, GraphQL cart operations, raw
  response types, mapping, and server commerce errors.
- Storefront agent: same-origin cart client, provider, sidebar/page UI,
  accessibility, and interaction states.
- Compliance agent: Shopify policies, policy routes, consent domain, and script
  gates.
- Quality agent: test infrastructure, integration/E2E fixtures, CI, and release
  checks.

Dependent work is sequential. Agents may run concurrently only when they own
disjoint files and consume already accepted interfaces.

