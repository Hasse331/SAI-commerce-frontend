# Shopify commerce setup

This guide prepares the Shopify-backed cart and hosted checkout. It applies
when `NEXT_PUBLIC_DATA_SOURCE=shopify`; mock mode remains available for local
UI work and must not become a production fallback.

The storefront uses the Storefront API for product, cart, and hosted-checkout
data. Shopify remains the source of truth for merchandise, availability,
prices, totals, and the checkout URL. The application does not require Admin
API access for this flow.

## Prerequisites and Headless configuration

Complete these actions in the Shopify admin with a staff role that has access
to Apps and sales channels:

1. Install or open Shopify's [Headless sales
   channel](https://shopify.dev/docs/storefronts/headless/bring-your-own-stack/index).
2. In **Sales channels > Headless**, create a storefront or select the
   storefront that will serve this deployment. A storefront has its own API
   tokens; Headless permissions are shared by storefronts in the channel.
3. On the storefront, open **Manage API access > Storefront API > Permissions**
   and enable the product and cart/checkout access required by this storefront.
   Shopify documents the permission workflow in [Getting started with the
   Storefront API](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started).
4. Publish each purchasable product to the **Headless** sales channel. The
   Headless channel manages product publication as well as API permissions and
   credentials; confirm the product is active and available to that channel.
5. For every product expected to be purchasable, confirm its first/default
   variant is available for sale and has a price and inventory/stock settings
   suitable for the store. If that variant is unavailable or missing, this UI
   deliberately shows its contact CTA instead of an add-to-cart action.
6. Configure a live payment provider before accepting real orders. For a test
   order, use Shopify Payments test mode or Shopify's [Bogus
   Gateway](https://help.shopify.com/en/manual/checkout-settings/test-orders).
   While a payment provider is in test mode, customers cannot place live card
   orders.
7. Configure the target [Markets](https://help.shopify.com/en/manual/markets),
   shipping profiles/rates and fulfillment locations in **Settings > Shipping
   and delivery**, and the applicable [tax settings](https://help.shopify.com/en/manual/taxes).
   Rates, currencies, product availability, and taxes can differ by market and
   are resolved by Shopify checkout.

## Environment configuration

Set the following values in the deployment environment and in untracked local
environment files for development. Do not put credentials in Git, issue
trackers, build output, screenshots, logs, or this guide.

```env
NEXT_PUBLIC_DATA_SOURCE=shopify
SHOPIFY_STORE_DOMAIN=
SHOPIFY_STOREFRONT_PUBLIC_TOKEN=
SHOPIFY_STOREFRONT_API_VERSION=2026-01
SHOPIFY_SHOP_ID=
SHOPIFY_STOREFRONT_ID=
```

`SHOPIFY_STORE_DOMAIN` is the Shopify store domain in the form
`your-store.myshopify.com`; do not use the custom storefront domain or include
a URL path. `NEXT_PUBLIC_DATA_SOURCE` must be exactly `shopify` for a Shopify
deployment (`mock` is for development/test content only).

Get `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` from the selected Headless storefront's
Storefront API token settings. This runtime passes it to the Shopify client as
`publicAccessToken`, so it must be a **public Storefront access token**. Do not
put a private Storefront token under this public-token variable name. A public
Storefront token is intended for browser/mobile storefront access and is not
Admin API access; nevertheless, protect all credentials and do not commit them.

Always set `SHOPIFY_STOREFRONT_API_VERSION` explicitly to a supported stable
version. This project uses `2026-01`. Shopify recommends explicitly selecting a
version and publishes its quarterly support schedule in [API
versioning](https://shopify.dev/docs/api/usage/versioning). The runtime requires
a nonblank `SHOPIFY_STOREFRONT_API_VERSION` and fails clearly when it is omitted;
it has no version fallback. Set `2026-01` for this deployment, review the chosen
stable version at least quarterly, and update it before Shopify support changes.
This documentation does not claim that the cart queries have been live-validated
against `2026-01`: the acceptance test below is required before release.

For Vercel deployments, add the values in **Project > Settings > Environment
Variables** and select the correct target. Put test-store/test-token values in
**Preview** and live-store/live-token values in **Production**; do not promote a
preview configuration to production without a live checkout acceptance test.
Redeploy after changing any server environment variable.

## Shopify Analytics and customer privacy

The storefront uses Shopify's framework-independent Hydrogen toolkit for
Shopify Analytics and Customer Privacy. It does not use the Hydrogen framework,
Oxygen, Google Analytics, Tag Manager, Meta Pixel, or another third-party
tracker.

Set these analytics identity values in Preview and Production in addition to
`SHOPIFY_STORE_DOMAIN`:

```env
SHOPIFY_SHOP_ID=
SHOPIFY_STOREFRONT_ID=
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
```

Use the numeric Shopify shop ID and the storefront ID belonging to the active
storefront in **Sales channels > Headless**. These variables are intentionally
not named `NEXT_PUBLIC_*`: Next.js reads them in the server layout and passes
only the public storefront identity and domain into Shopify's browser runtime.
No Admin API access token, private Storefront token, or additional analytics
token is used. When any of the three values is absent, the runtime is omitted
and analytics remains disabled.

In Shopify Admin:

1. Open **Sales channels > Headless**, select the storefront used by this
   deployment, and verify that it is the storefront represented by
   `SHOPIFY_STOREFRONT_ID`.
2. Configure the production storefront and Shopify checkout domains so they
   share the same registrable root
   domain (for example, `www.example.com` and `checkout.example.com`). Shopify's
   consent and analytics cookies cannot be validated reliably across unrelated
   registrable domains.
3. Review Shopify's **Settings > Customer privacy** configuration, including
   the applicable regions and data-sale/opt-out settings. The custom storefront
   banner is shown to every new visitor, regardless of Shopify's regional
   requirement result, and synchronizes an explicit decision through Shopify's
   Customer Privacy API.
4. Redeploy after changing identity or domain configuration. Do not validate a
   production analytics release solely on localhost.

The custom banner has Necessary, Analytics, Preferences, and Marketing
categories. Necessary is always enabled. All optional categories default to
disabled. Visitors can accept all, reject optional categories, customize and
save, and reopen settings from the footer. The versioned first-party
`sai_consent` cookie persists a valid decision for 180 days. Missing, malformed,
expired, or obsolete consent reopens the banner and keeps optional processing
off. Preferences and Marketing currently have no script consumers.

Shopify Analytics publishes only page-view and product-view events after both
the local Analytics choice and Shopify's effective Customer Privacy state allow
processing. Add-to-cart and cart-update analytics are not implemented: the
current toolkit requires the root Shopify cart ID in its browser payload, while
this storefront deliberately keeps that secret in the HttpOnly `sai_cart_id`
session. Do not expose, copy, hash, or fabricate that ID to add those events.

### Production Live View acceptance

Use the deployed production domain (or a production-equivalent domain with the
same registrable-domain arrangement), and avoid recording visitor identifiers
or cookie contents in evidence:

1. Clear the site's consent cookie or use a fresh browser profile. Confirm the
   banner appears and no Shopify page/product analytics is emitted before a
   choice.
2. Choose **Reject optional**, navigate between pages and open a product.
   Confirm the footer can reopen settings and Shopify Analytics remains quiet.
3. Reopen settings, enable **Analytics**, and save. Confirm the decision
   persists across reloads and Shopify's Customer Privacy state permits
   analytics processing.
4. In Shopify Admin's Analytics **Live View**, open distinct storefront pages
   and a product on the deployed domain. Confirm page and product activity
   appears once per navigation/view after normal processing delay.
5. Disable Analytics again and confirm subsequent navigation/product views are
   not published. Also verify Accept all, Reject optional, Customize, Escape,
   keyboard focus, and the footer reopen interaction.

Do not claim acceptance based on localhost, unit-test event mocks, or cart/add
events. Live View delivery depends on Shopify configuration and must be observed
against the deployed domain.

### Analytics troubleshooting and rollback

- No banner: clear `sai_consent`, verify cookies are permitted, and check that
  the browser is not retaining a current 180-day decision.
- No Live View activity after opt-in: verify all three identity/domain values,
  redeploy, confirm the Headless storefront ID and same registrable domain,
  inspect Shopify Customer Privacy settings, and test without content blockers.
- Events before consent or after opt-out: stop the release and roll back to the
  previous known-good commit; do not weaken either consent gate.
- Duplicate events: reproduce with one navigation and one product visit and
  stop release until deduplication is restored.

For a configuration-only emergency rollback, remove or blank
`SHOPIFY_SHOP_ID` or `SHOPIFY_STOREFRONT_ID` in the deployment environment and
redeploy. The server then omits Shopify's analytics/privacy runtime, leaving
analytics off while necessary storefront and cart behavior remains available.
Restore the values only after Preview checks pass. A code rollback should deploy
the previous known-good commit; never expose the HttpOnly cart ID or introduce a
third-party pixel as a workaround.

Before release, run from `app/`:

```bash
npm run lint
npm test
npm run build
```

All commands must pass, followed by the production-domain consent and Live View
acceptance above. A build blocked by package/CDN network access remains
outstanding rather than being treated as a successful release check.

## Store policies

In **Settings > Policies**, add and publish the merchant-approved content for
**Privacy**, **Refund**, **Shipping**, and **Terms of Service**. The storefront
reads these four Shopify-managed policies and publishes an available policy at
its local `/policies/[handle]` page. Storefront policy content is cached for
approximately 60 seconds, so allow for that delay after saving a policy before
checking the deployed page.

Missing or blank policies are omitted from local pages, the footer, sitemap,
and the pre-checkout disclosure. The application never replaces a missing policy
with hardcoded legal text.

The merchant and legal owner remain responsible for policy content, languages,
markets, and obtaining appropriate legal review. This software behavior is not
legal advice or a compliance guarantee.

## Release acceptance test

Use a non-production product and a test payment configuration. Never record a
cart ID, checkout URL, buyer data, or credential in test notes or output.

1. Open an in-stock product with an available default variant and add it to the
   cart. Confirm an unavailable product or a product without an available
   default variant has no add-to-cart action and instead shows the contact CTA.
2. Refresh the page and confirm the cart persists. The cart ID is held only in
   the HTTP-only `sai_cart_id` cookie; it must not appear in local storage,
   application JSON, logs, or test evidence.
3. Change a quantity (allowed range is 1–99), remove a line, and remove the
   final line. Confirm Shopify-provided totals and the empty state are correct.
4. Test expired-cart recovery: start with a cart, then use an expired or removed
   Shopify cart session. Confirm the app clears the stale session safely;
   adding an item creates a fresh cart, while line updates/removals prompt a
   recoverable missing/expired-session state.
5. Select **Proceed to checkout**. Verify Shopify checkout contains the exact
   product, quantity, price, currency, and the unmodified checkout handoff;
   complete a test order.
6. In **Orders**, confirm the completed order is attributed to the Headless
   storefront in the Channel column. Shopify documents that Headless storefront
   attribution is channel-level in [Manage the Headless
   channel](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/manage-headless-channels).
7. Disable test mode or the Bogus Gateway before enabling real-card orders.

## Policy publishing Preview/UAT

Use the Preview deployment after the storefront content-cache delay and record
only safe, non-sensitive evidence.

1. For every available policy, open its local `/policies/[handle]` page and
   confirm the Shopify title and policy content are shown.
2. Confirm the footer's **Policies** group contains exactly the available local
   policy links, in the expected Shopify order; it must not appear when no
   policies are available.
3. Add an item to the cart and confirm both the cart sidebar and `/cart` show
   the Shopify-hosted checkout disclosure with the same available local policy
   links immediately before **Proceed to checkout**.
4. Continue to Shopify checkout and confirm Shopify-hosted policy links are
   present and lead to the applicable Shopify-managed policies.
5. Never record credentials, buyer data, cart IDs, or checkout URLs in UAT
   evidence, screenshots, logs, or issue trackers.

## Public Storefront token replacement and recovery

This runtime consumes a **public** Storefront token through `publicAccessToken`.
Shopify Headless has a **Rotate private access token** control, but that control
and its private-token overlap behavior are unrelated to this runtime and must
not be used or relied on for this public-token replacement.

Use a new Headless storefront for a controlled public-token cutover:

1. In **Sales channels > Headless**, add another storefront. Shopify documents
   the [add-storefront flow and token relationship](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/manage-headless-channels):
   each storefront has its own tokens, while the channel's permissions are
   shared.
2. Copy the new storefront's **public** Storefront token into the existing
   `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` environment variable for the Preview
   deployment only. Do not commit or record the value.
3. Deploy Preview, complete the cart and checkout acceptance test above, and
   verify the resulting test order is attributed to the **new** storefront in
   Shopify Orders.
4. After Preview succeeds, set the same new public token for Production,
   redeploy, and repeat the production-safe acceptance check before declaring
   the cutover complete.
5. Keep the old and new storefronts intentionally active while this cutover is
   being verified. A new storefront changes the Headless order-attribution
   identity. Do not infer any public-token rotation or overlap semantics from
   this parallel storefront setup.
6. When no deployment still uses the old storefront, delete or otherwise retire
   it as supported by the Headless channel. Shopify's [delete-storefront
   guidance](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/manage-headless-channels)
   notes that deletion invalidates its Storefront API tokens and cannot be
   undone.

Creating Storefront tokens through a custom app or the Admin API is outside the
scope of this workflow. Admin API access remains unnecessary for the normal
cart and hosted-checkout flow.

If a release fails, immediately deploy the previous known-good `main` commit,
then investigate configuration, token permissions, product publication,
inventory, payment mode, markets, shipping, and tax setup. Do not construct a
checkout URL, substitute mock data in Shopify mode, or expose a private token
as a recovery measure.

## Scope boundary

Phase 3 covers Shopify Customer Privacy synchronization and consent-gated page
and product analytics. Cart/add analytics and all third-party analytics remain
out of scope.
