import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveStorefrontApiVersion,
  storefrontQuery,
} from "./storefront-client.ts";

test("rejects a missing or blank Storefront API version", () => {
  for (const value of [undefined, "", "   "]) {
    assert.throws(
      () => resolveStorefrontApiVersion(value),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.equal(error.message, "Missing SHOPIFY_STOREFRONT_API_VERSION");
        return true;
      },
    );
  }
});

test("returns an explicit Storefront API version trimmed", () => {
  assert.equal(resolveStorefrontApiVersion(" 2099-01 "), "2099-01");
  assert.equal(resolveStorefrontApiVersion("2026-07"), "2026-07");
});

test("keeps content requests revalidated while cart requests are no-store", async () => {
  const originalFetch = globalThis.fetch;
  const originalEnvironment = {
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN,
    storefrontToken: process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN,
    apiVersion: process.env.SHOPIFY_STOREFRONT_API_VERSION,
  };
  const requestInits: RequestInit[] = [];

  process.env.SHOPIFY_STORE_DOMAIN = "cache-contract.myshopify.com";
  process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN = "public-test-token";
  process.env.SHOPIFY_STOREFRONT_API_VERSION = "2026-07";
  globalThis.fetch = async (_url, init) => {
    requestInits.push(init ?? {});
    return new Response(JSON.stringify({ data: { shop: { name: "Test" } } }), {
      headers: { "content-type": "application/json" },
      status: 200,
    });
  };

  try {
    await storefrontQuery<{ shop: { name: string } }>("query Content { shop { name } }");
    await storefrontQuery<{ shop: { name: string } }>(
      "query Cart { shop { name } }",
      undefined,
      { cache: "no-store" },
    );
  } finally {
    globalThis.fetch = originalFetch;

    for (const [name, value] of [
      ["SHOPIFY_STORE_DOMAIN", originalEnvironment.storeDomain],
      ["SHOPIFY_STOREFRONT_PUBLIC_TOKEN", originalEnvironment.storefrontToken],
      ["SHOPIFY_STOREFRONT_API_VERSION", originalEnvironment.apiVersion],
    ] as const) {
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  }

  assert.equal(requestInits.length, 2);
  assert.deepEqual(requestInits[0].next, { revalidate: 60 });
  assert.equal(requestInits[0].cache, undefined);
  assert.equal(requestInits[1].cache, "no-store");
  assert.equal(requestInits[1].next, undefined);
});
