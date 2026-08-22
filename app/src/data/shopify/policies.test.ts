import assert from "node:assert/strict";
import test from "node:test";
import {
  createShopifyPolicyClient,
  STORE_POLICIES_QUERY,
} from "./policies.ts";

function getPolicyFieldNames(policyField: string): string[] {
  const match = STORE_POLICIES_QUERY.match(
    new RegExp(`\\b${policyField}\\s*\\{([^{}]*)\\}`),
  );

  assert.ok(match, `Missing ${policyField} selection.`);
  return match[1].match(/\b[A-Za-z_][A-Za-z0-9_]*\b/g) ?? [];
}

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
    assert.deepEqual(
      getPolicyFieldNames(policyField),
      ["title", "body", "handle", "url"],
      `${policyField} must request only its documented fields.`,
    );
  }
});
