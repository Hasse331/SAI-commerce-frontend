import assert from "node:assert/strict";
import test from "node:test";
import { resolveStorefrontApiVersion } from "./storefront-client.ts";

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
