import assert from "node:assert/strict";
import test from "node:test";
import {
  clampCartQuantity,
  formatCartMoney,
  getDecrementAction,
} from "./cart-presentation";

test("formatCartMoney renders a string amount using its Shopify currency", () => {
  assert.equal(
    formatCartMoney({ amount: "1234.5", currencyCode: "USD" }),
    "$1,234.50",
  );
});

test("clampCartQuantity keeps cart quantities between one and ninety-nine", () => {
  assert.equal(clampCartQuantity(0), 1);
  assert.equal(clampCartQuantity(42), 42);
  assert.equal(clampCartQuantity(100), 99);
});

test("getDecrementAction removes a line when its quantity is one", () => {
  assert.deepEqual(getDecrementAction(1), { type: "remove" });
});

test("getDecrementAction updates a line above the minimum quantity", () => {
  assert.deepEqual(getDecrementAction(2), { type: "update", quantity: 1 });
});
