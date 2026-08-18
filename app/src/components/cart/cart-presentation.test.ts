import assert from "node:assert/strict";
import test from "node:test";
import {
  formatCartMoney,
  getCartQuantityPresentation,
  getDecrementAction,
} from "./cart-presentation";

test("formatCartMoney renders a string amount using its Shopify currency", () => {
  assert.equal(
    formatCartMoney({ amount: "1234.5", currencyCode: "USD" }),
    "$1,234.50",
  );
});

test("cart quantity presentation preserves Shopify quantity above the editable limit", () => {
  assert.deepEqual(getCartQuantityPresentation(100), {
    quantity: 100,
    canIncrement: false,
  });
});

test("cart quantity presentation allows incrementing quantities below the editable limit", () => {
  assert.deepEqual(getCartQuantityPresentation(42), {
    quantity: 42,
    canIncrement: true,
  });
});

test("getDecrementAction removes a line when its quantity is one", () => {
  assert.deepEqual(getDecrementAction(1), { type: "remove" });
});

test("getDecrementAction updates a line above the minimum quantity", () => {
  assert.deepEqual(getDecrementAction(2), { type: "update", quantity: 1 });
});

test("getDecrementAction safely returns an oversized Shopify quantity to the editable limit", () => {
  assert.deepEqual(getDecrementAction(100), { type: "update", quantity: 99 });
});
