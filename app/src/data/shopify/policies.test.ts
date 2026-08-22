import assert from "node:assert/strict";
import test from "node:test";
import {
  createShopifyPolicyClient,
  STORE_POLICIES_QUERY,
} from "./policies.ts";

test("policy client queries only the four documented ShopPolicy fields", async () => {
  const requests: string[] = [];
  const client = createShopifyPolicyClient(async <TData>(query: string) => {
    requests.push(query);
    return {
      shop: {
        privacyPolicy: null,
        refundPolicy: null,
        shippingPolicy: null,
        termsOfService: null,
      },
    } as TData;
  });

  const policies = await client.getShopifyPolicies();

  assert.deepEqual(policies, {
    privacyPolicy: null,
    refundPolicy: null,
    shippingPolicy: null,
    termsOfService: null,
  });
  assert.deepEqual(requests, [STORE_POLICIES_QUERY]);

  for (const policyField of [
    "privacyPolicy",
    "refundPolicy",
    "shippingPolicy",
    "termsOfService",
  ]) {
    assert.match(
      STORE_POLICIES_QUERY,
      new RegExp(`${policyField}\\s*\\{\\s*title\\s+body\\s+handle\\s+url\\s*\\}`),
    );
  }
  assert.doesNotMatch(STORE_POLICIES_QUERY, /\bname\b|\bid\b|\bmetafield\b/);
});
