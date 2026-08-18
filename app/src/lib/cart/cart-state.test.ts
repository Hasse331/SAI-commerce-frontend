import assert from "node:assert/strict";
import test from "node:test";

import { cartStateReducer, initialCartState } from "./cart-state";

const firstCart = {
  checkoutUrl: "https://store.example/cart/c/cart-123",
  totalQuantity: 1,
  subtotal: { amount: "15.00", currencyCode: "USD" },
  total: { amount: "15.00", currencyCode: "USD" },
  lines: [],
};

const secondCart = {
  ...firstCart,
  totalQuantity: 2,
  total: { amount: "30.00", currencyCode: "USD" },
};

test("cart state starts loading and accepts a loaded cart or no active cart", () => {
  assert.deepEqual(initialCartState, {
    cart: null,
    status: "loading",
    error: null,
    isOpen: false,
  });
  assert.deepEqual(
    cartStateReducer(initialCartState, { type: "loadSucceeded", cart: null }),
    { ...initialCartState, status: "ready" },
  );
  assert.deepEqual(
    cartStateReducer(initialCartState, { type: "loadSucceeded", cart: firstCart }),
    { ...initialCartState, cart: firstCart, status: "ready" },
  );
});

test("cart mutations replace the last cart only after server success", () => {
  const readyState = cartStateReducer(initialCartState, {
    type: "loadSucceeded",
    cart: firstCart,
  });
  const mutatingState = cartStateReducer(readyState, { type: "mutationStarted" });

  assert.deepEqual(mutatingState, { ...readyState, status: "mutating", error: null });
  assert.deepEqual(
    cartStateReducer(mutatingState, { type: "mutationSucceeded", cart: secondCart }),
    { ...readyState, cart: secondCart },
  );
});

test("a mutation failure keeps the last good cart and can be cleared", () => {
  const readyState = cartStateReducer(initialCartState, {
    type: "loadSucceeded",
    cart: firstCart,
  });
  const failedState = cartStateReducer(readyState, {
    type: "mutationFailed",
    error: "Cart session has expired.",
  });

  assert.deepEqual(failedState, {
    ...readyState,
    status: "error",
    error: "Cart session has expired.",
  });
  assert.deepEqual(cartStateReducer(failedState, { type: "clearError" }), readyState);
});

test("a missing cart session clears the stale cart while preserving the safe error", () => {
  const readyState = cartStateReducer(initialCartState, {
    type: "loadSucceeded",
    cart: firstCart,
  });

  assert.deepEqual(
    cartStateReducer(readyState, {
      type: "sessionFailed",
      error: "Cart session has expired.",
    }),
    {
      ...readyState,
      cart: null,
      status: "error",
      error: "Cart session has expired.",
    },
  );
});

test("a successful add opens the cart after the server returns the replacement cart", () => {
  const mutatingState = cartStateReducer(initialCartState, { type: "mutationStarted" });

  assert.deepEqual(
    cartStateReducer(mutatingState, { type: "addSucceeded", cart: firstCart }),
    { ...initialCartState, cart: firstCart, status: "ready", isOpen: true },
  );
});
