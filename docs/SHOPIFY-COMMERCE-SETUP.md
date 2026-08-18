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
SHOPIFY_STOREFRONT_API_VERSION=2026-07
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
version. At the time of this guide (2026-08-18), `2026-07` is Shopify's latest
stable Storefront API version. Shopify recommends explicitly selecting a
version and publishes its current support schedule in [API
versioning](https://shopify.dev/docs/api/usage/versioning). The current runtime
fallback is `2025-01`, which is retired; deployments must set the variable to
`2026-07` until that fallback is fixed or otherwise verified. This documentation
does not claim that the cart queries have been live-validated against `2026-07`:
the acceptance test below is required before release.

For Vercel deployments, add the values in **Project > Settings > Environment
Variables** and select the correct target. Put test-store/test-token values in
**Preview** and live-store/live-token values in **Production**; do not promote a
preview configuration to production without a live checkout acceptance test.
Redeploy after changing any server environment variable.

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

## Credential rotation and recovery

Rotate a Storefront API credential from the selected Headless storefront:

1. Generate the replacement credential in **Sales channels > Headless >
   storefront > Manage API access**.
2. Update the appropriate local untracked environment file and/or deployment
   environment target. Do not commit the value.
3. Redeploy and run the relevant cart and checkout acceptance test.
4. Revoke the old credential only after the new deployment works. Shopify keeps
   old and new credentials valid during this handoff; see [Bring your own
   headless stack](https://shopify.dev/docs/storefronts/headless/bring-your-own-stack/index).

If a release fails, immediately deploy the previous known-good `main` commit,
then investigate configuration, token permissions, product publication,
inventory, payment mode, markets, shipping, and tax setup. Do not construct a
checkout URL, substitute mock data in Shopify mode, or expose a private token
as a recovery measure.

## Out of scope

Legal policy pages and cookie-consent controls are Phase 2 work. This release
does not represent them as complete, and it does not hardcode policy links
before their routes exist.
