import assert from "node:assert/strict";
import test from "node:test";
import { consentSignalAction, createBoundedCompletion, createEventDeduper, createPrivacySynchronizer, isAnalyticsPublisherReady, isAnalyticsReady, mapConsentToShopify, mapProductView } from "./adapter.ts";

test("maps the app consent categories to Shopify's consent vocabulary", () => {
  assert.deepEqual(
    mapConsentToShopify(
      { necessary: true, analytics: true, preferences: false, marketing: true },
      {
        checkoutRootDomain: "checkout.spectrumaudio.net",
        storefrontRootDomain: "spectrumaudio.net",
        storefrontAccessToken: "public-storefront-token",
      },
    ),
    {
      analytics: true,
      preferences: false,
      marketing: true,
      sale_of_data: false,
      headlessStorefront: true,
      checkoutRootDomain: "checkout.spectrumaudio.net",
      storefrontRootDomain: "spectrumaudio.net",
      storefrontAccessToken: "public-storefront-token",
    },
  );
});

test("analytics readiness fails closed unless local consent and Shopify readiness both allow it", () => {
  assert.equal(isAnalyticsReady(true, { consentStatus: "loaded", analyticsProcessingAllowed: () => true }), true);
  assert.equal(isAnalyticsReady(false, { consentStatus: "loaded", analyticsProcessingAllowed: () => true }), false);
  assert.equal(isAnalyticsReady(true, { consentStatus: "pending", analyticsProcessingAllowed: () => true }), false);
  assert.equal(isAnalyticsReady(true, { consentStatus: "loaded", analyticsProcessingAllowed: () => { throw new Error("unavailable"); } }), false);
  assert.equal(isAnalyticsReady(true, undefined), false);
});

test("maps exact normalized Shopify identities and commerce values to product view", () => {
  assert.deepEqual(mapProductView({ productId: "gid://shopify/Product/1", variantId: "gid://shopify/ProductVariant/2", title: "SAI 1", price: "199.95", vendor: "Spectrum", variantTitle: "Black", quantity: 1, sku: "SAI-BLK" }), {
    products: [{ id: "gid://shopify/Product/1", title: "SAI 1", price: "199.95", vendor: "Spectrum", variantId: "gid://shopify/ProductVariant/2", variantTitle: "Black", quantity: 1, sku: "SAI-BLK" }],
  });
});

test("deduper tracks each event type independently when events interleave", () => {
  const deduper = createEventDeduper();
  assert.equal(deduper.shouldPublish("page", "/products"), true);
  assert.equal(deduper.shouldPublish("product", "variant-1"), true);
  assert.equal(deduper.shouldPublish("page", "/products"), false);
  assert.equal(deduper.shouldPublish("product", "variant-1"), false);
});

test("privacy synchronizer queues the latest explicit choice, retries readiness, and syncs it once", () => {
  const synced: string[] = [];
  const synchronizer = createPrivacySynchronizer<string>();
  synchronizer.enqueue("accept");
  assert.equal(synchronizer.flush(false, () => {}), false);
  synchronizer.enqueue("accept");
  assert.equal(synchronizer.flush(true, (value, complete) => { synced.push(value); complete(false); }), true);
  assert.equal(synchronizer.flush(true, (value, complete) => { synced.push(value); complete(true); }), true);
  synchronizer.enqueue("accept");
  assert.deepEqual(synced, ["accept", "accept"]);
  assert.equal(synchronizer.flush(true, () => {}), false);
});

test("hydrated consent updates the local gate without requesting Shopify synchronization", () => {
  assert.deepEqual(consentSignalAction("hydrated", true), {
    analyticsGranted: true,
    shouldSynchronize: false,
  });
  assert.deepEqual(consentSignalAction("explicit", false), {
    analyticsGranted: false,
    shouldSynchronize: true,
  });
  assert.deepEqual(consentSignalAction("persistenceFailure", true), {
    analyticsGranted: false,
    shouldSynchronize: false,
  });
});

test("analytics publisher readiness stays false until both privacy and the bus are ready", () => {
  const privacy = { consentStatus: "loaded" as const, analyticsProcessingAllowed: () => true };
  assert.equal(isAnalyticsPublisherReady(true, privacy, undefined), false);
  assert.equal(isAnalyticsPublisherReady(true, privacy, { publish: () => undefined }), true);
});

test("bounded completion releases a missing callback exactly once after timeout", () => {
  let timeout: (() => void) | undefined;
  const results: boolean[] = [];
  const completion = createBoundedCompletion<boolean>(
    (succeeded) => results.push(succeeded),
    (callback) => { timeout = callback; return 1; },
    () => undefined,
  );
  timeout?.();
  completion.complete(true);
  assert.deepEqual(results, [false]);
});
