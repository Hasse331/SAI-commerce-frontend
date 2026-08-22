import assert from "node:assert/strict";
import test from "node:test";
import { createPolicyLoaders } from "./policies.ts";

const policy = {
  title: "Privacy policy",
  handle: "privacy",
  href: "/policies/privacy",
  bodyHtml: "<p>Privacy details</p>",
};

test("policy loader returns no policy content in mock mode", async () => {
  const loaders = createPolicyLoaders({
    isShopifySource: () => false,
    getShopifyPolicies: async () => {
      throw new Error("Shopify must not be queried in mock mode");
    },
  });

  assert.deepEqual(await loaders.getStorePolicies(), []);
  assert.equal(await loaders.getStorePolicy("privacy"), undefined);
});

test("policy loader returns exact Shopify policy handle matches only", async () => {
  const loaders = createPolicyLoaders({
    isShopifySource: () => true,
    getShopifyPolicies: async () => [policy],
  });

  assert.deepEqual(await loaders.getStorePolicies(), [policy]);
  assert.deepEqual(await loaders.getStorePolicy("privacy"), policy);
  assert.equal(await loaders.getStorePolicy("Privacy"), undefined);
  assert.equal(await loaders.getStorePolicy("privacy/"), undefined);
});

test("policy loader propagates Shopify failures", async () => {
  const failure = new Error("Shopify unavailable");
  const loaders = createPolicyLoaders({
    isShopifySource: () => true,
    getShopifyPolicies: async () => {
      throw failure;
    },
  });

  await assert.rejects(loaders.getStorePolicies(), failure);
});
