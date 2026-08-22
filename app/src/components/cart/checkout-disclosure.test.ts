import assert from "node:assert/strict";
import test from "node:test";
import { getCheckoutDisclosure } from "./checkout-disclosure";

test("checkout disclosure is omitted without available policies", () => {
  assert.equal(getCheckoutDisclosure([]), undefined);
});

test("checkout disclosure uses supplied local policy links", () => {
  assert.deepEqual(
    getCheckoutDisclosure([
      { handle: "privacy", title: "Privacy policy", href: "/policies/privacy" },
    ]),
    {
      message: "Checkout is hosted by Shopify. Review the store policies before continuing.",
      links: [{ label: "Privacy policy", href: "/policies/privacy" }],
    },
  );
});
