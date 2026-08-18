import assert from "node:assert/strict";
import test from "node:test";

import { CartOperationError } from "@/data/shopify/cart/operations";
import type { Cart } from "@/types/cart";
import { DELETE, PATCH } from "./route";

const cart: Cart = {
  id: "cart-123",
  checkoutUrl: "https://store.example/cart/c/cart-123",
  totalQuantity: 1,
  subtotal: { amount: "15.00", currencyCode: "USD" },
  total: { amount: "15.00", currencyCode: "USD" },
  lines: [],
};

const publicCart = {
  checkoutUrl: "https://store.example/cart/c/cart-123",
  totalQuantity: 1,
  subtotal: { amount: "15.00", currencyCode: "USD" },
  total: { amount: "15.00", currencyCode: "USD" },
  lines: [],
};

function assertPublicCartResponse(body: unknown): void {
  assert.deepEqual(body, { cart: publicCart });
  assert.equal("id" in (body as { cart: Record<string, unknown> }).cart, false);
}

function createOperations(overrides: Partial<{
  getCart: (cartId: string) => Promise<Cart | null>;
  updateCartLine: (cartId: string, lineId: string, quantity: number) => Promise<Cart>;
  removeCartLine: (cartId: string, lineId: string) => Promise<Cart>;
}> = {}) {
  return {
    getCart: async () => cart,
    updateCartLine: async () => cart,
    removeCartLine: async () => cart,
    ...overrides,
  };
}

function request(method: "PATCH" | "DELETE", body: unknown): Request {
  return new Request("https://store.example/api/cart/lines", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("line mutations reject a missing cart session", async () => {
  const patchResponse = await PATCH.handle(
    new Request("https://store.example/api/cart/lines", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: "{",
    }),
    { cartId: undefined, operations: createOperations() },
  );
  const deleteResponse = await DELETE.handle(request("DELETE", { lineId: "line-1" }), {
    cartId: undefined,
    operations: createOperations(),
  });

  assert.deepEqual(await patchResponse.json(), {
    error: { code: "CART_SESSION_MISSING", message: "Cart session is missing." },
  });
  assert.equal(patchResponse.status, 409);
  assert.equal(deleteResponse.status, 409);
  assert.equal((await deleteResponse.json()).error.code, "CART_SESSION_MISSING");
});

test("PATCH validates a non-empty line ID and integer quantity from one to ninety-nine", async () => {
  const invalidBodies = [
    { lineId: " ", quantity: 1 },
    { lineId: "line-1", quantity: 1.5 },
    { lineId: "line-1", quantity: 0 },
    { lineId: "line-1", quantity: 100 },
    { lineId: ["line-1"], quantity: 1 },
    { lineId: "line-1", quantity: "1" },
  ];

  for (const body of invalidBodies) {
    const response = await PATCH.handle(request("PATCH", body), {
      cartId: "cart-123",
      operations: createOperations(),
    });

    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, "INVALID_CART_INPUT");
  }
});

test("PATCH returns the updated public cart", async () => {
  let updatedWith: [string, string, number] | undefined;
  const response = await PATCH.handle(request("PATCH", { lineId: " line-1 ", quantity: 4 }), {
    cartId: "cart-123",
    operations: createOperations({
      updateCartLine: async (cartId, lineId, quantity) => {
        updatedWith = [cartId, lineId, quantity];
        return cart;
      },
    }),
  });

  assert.equal(response.status, 200);
  assertPublicCartResponse(await response.json());
  assert.deepEqual(updatedWith, ["cart-123", "line-1", 4]);
});

test("DELETE validates a non-empty line ID and returns the updated public cart", async () => {
  const invalidResponse = await DELETE.handle(request("DELETE", { lineId: " " }), {
    cartId: "cart-123",
    operations: createOperations(),
  });
  let removedWith: [string, string] | undefined;
  const response = await DELETE.handle(request("DELETE", { lineId: " line-1 " }), {
    cartId: "cart-123",
    operations: createOperations({
      removeCartLine: async (cartId, lineId) => {
        removedWith = [cartId, lineId];
        return cart;
      },
    }),
  });

  assert.equal(invalidResponse.status, 400);
  assert.equal((await invalidResponse.json()).error.code, "INVALID_CART_INPUT");
  assert.equal(response.status, 200);
  assertPublicCartResponse(await response.json());
  assert.deepEqual(removedWith, ["cart-123", "line-1"]);
});

test("line mutations clear an expired Shopify cart session", async () => {
  const patchResponse = await PATCH.handle(
    new Request("https://store.example/api/cart/lines", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: "{",
    }),
    { cartId: "expired-cart", operations: createOperations({ getCart: async () => null }) },
  );
  const deleteResponse = await DELETE.handle(request("DELETE", { lineId: "line-1" }), {
    cartId: "expired-cart",
    operations: createOperations({ getCart: async () => null }),
  });

  assert.equal(patchResponse.status, 409);
  assert.equal((await patchResponse.json()).error.code, "CART_SESSION_EXPIRED");
  assert.match(patchResponse.headers.get("set-cookie") ?? "", /Max-Age=0/);
  assert.equal(deleteResponse.status, 409);
  assert.equal((await deleteResponse.json()).error.code, "CART_SESSION_EXPIRED");
  assert.match(deleteResponse.headers.get("set-cookie") ?? "", /Max-Age=0/);
});

test("line mutations return a generic error for Shopify failures", async () => {
  const response = await PATCH.handle(request("PATCH", { lineId: "line-1", quantity: 1 }), {
    cartId: "cart-123",
    operations: createOperations({
      updateCartLine: async () => {
        throw new CartOperationError("OUT_OF_STOCK", "Internal Shopify detail");
      },
    }),
  });

  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), {
    error: { code: "CART_OPERATION_FAILED", message: "Cart operation failed." },
  });
});
