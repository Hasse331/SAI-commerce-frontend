import assert from "node:assert/strict";
import test from "node:test";
import { createEventDeduper, isAnalyticsReady, mapConsentToShopify, mapProductView } from "./adapter.ts";

test("maps the app consent categories to Shopify's consent vocabulary", () => {
  assert.deepEqual(
    mapConsentToShopify({ necessary: true, analytics: true, preferences: false, marketing: true }),
    { analytics: true, preferences: false, marketing: true, sale_of_data: false },
  );
});

test("analytics readiness fails closed unless local consent and Shopify readiness both allow it", () => {
  assert.equal(isAnalyticsReady(true, { consentStatus: "loaded", analyticsProcessingAllowed: () => true }), true);
  assert.equal(isAnalyticsReady(false, { consentStatus: "loaded", analyticsProcessingAllowed: () => true }), false);
  assert.equal(isAnalyticsReady(true, { consentStatus: "pending", analyticsProcessingAllowed: () => true }), false);
  assert.equal(isAnalyticsReady(true, { consentStatus: "loaded", analyticsProcessingAllowed: () => { throw new Error("unavailable"); } }), false);
  assert.equal(isAnalyticsReady(true, undefined), false);
});

test("maps normalized product data to the Shopify product-view event", () => {
  assert.deepEqual(mapProductView({ slug: "sai-1", merchandiseId: "gid://shopify/ProductVariant/2", title: "SAI 1", price: "199.00", vendor: "Spectrum", quantity: 1 }), {
    products: [{ id: "sai-1", title: "SAI 1", price: "199.00", vendor: "Spectrum", variantId: "gid://shopify/ProductVariant/2", variantTitle: "SAI 1", quantity: 1 }],
  });
});

test("deduper accepts a changed event key and rejects React rerenders of the same key", () => {
  const deduper = createEventDeduper();
  assert.equal(deduper.shouldPublish("page:/products"), true);
  assert.equal(deduper.shouldPublish("page:/products"), false);
  assert.equal(deduper.shouldPublish("page:/products/sai-1"), true);
});
