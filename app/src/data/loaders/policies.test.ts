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

test("memoized policy loaders share one Shopify load for concurrent list and lookup consumers", async () => {
  let loadCount = 0;
  const loaders = createPolicyLoaders({
    isShopifySource: () => true,
    getShopifyPolicies: async () => {
      loadCount += 1;
      return [policy];
    },
    memoize: (load) => {
      let result: ReturnType<typeof load> | undefined;

      return (() => {
        result ??= load();
        return result;
      }) as typeof load;
    },
  });

  const [policies, matchedPolicy] = await Promise.all([
    loaders.getStorePolicies(),
    loaders.getStorePolicy("privacy"),
  ]);

  assert.deepEqual(policies, [policy]);
  assert.deepEqual(matchedPolicy, policy);
  assert.equal(loadCount, 1);
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
