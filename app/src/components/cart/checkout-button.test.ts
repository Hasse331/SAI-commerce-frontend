import assert from "node:assert/strict";
import test from "node:test";
import type { PublicCart } from "@/types/cart";
import { getCheckoutHref } from "./checkout-button";

function makeCart(overrides: Partial<PublicCart> = {}): PublicCart {
  return {
    checkoutUrl: "https://checkout.example.test/cart/c/synthetic?key=synthetic#review",
    totalQuantity: 1,
    subtotal: { amount: "15.00", currencyCode: "USD" },
    total: { amount: "15.00", currencyCode: "USD" },
    lines: [
      {
        id: "line-1",
        merchandiseId: "variant-1",
        title: "Test instrument",
        slug: "test-instrument",
        quantity: 1,
        image: null,
        unitPrice: { amount: "15.00", currencyCode: "USD" },
        totalPrice: { amount: "15.00", currencyCode: "USD" },
      },
    ],
    ...overrides,
  };
}

test("getCheckoutHref returns null when there is no cart", () => {
  assert.equal(getCheckoutHref(null), null);
});

test("getCheckoutHref returns null when the cart has no lines", () => {
  assert.equal(getCheckoutHref(makeCart({ lines: [] })), null);
});

test("getCheckoutHref returns null when the cart total quantity is not positive", () => {
  assert.equal(getCheckoutHref(makeCart({ totalQuantity: 0 })), null);
  assert.equal(getCheckoutHref(makeCart({ totalQuantity: -1 })), null);
});

test("getCheckoutHref returns null for malformed, non-HTTPS, or padded URLs", () => {
  assert.equal(getCheckoutHref(makeCart({ checkoutUrl: "not a URL" })), null);
  assert.equal(getCheckoutHref(makeCart({ checkoutUrl: "http://checkout.example.test/cart" })), null);
  assert.equal(
    getCheckoutHref(makeCart({ checkoutUrl: " https://checkout.example.test/cart " })),
    null,
  );
});

test("getCheckoutHref returns the exact HTTPS checkout URL", () => {
  const checkoutUrl = "https://checkout.example.test/cart/c/synthetic?key=synthetic&return=%2Fcart#review";

  assert.equal(getCheckoutHref(makeCart({ checkoutUrl })), checkoutUrl);
});
