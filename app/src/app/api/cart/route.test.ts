import assert from "node:assert/strict";
import test from "node:test";

import { CartOperationError } from "@/data/shopify/cart/operations";
import type { Cart } from "@/types/cart";
import { GET, POST } from "./route";

const cart: Cart = {
  id: "cart-123",
  checkoutUrl: "https://store.example/cart/c/cart-123",
  totalQuantity: 2,
  subtotal: { amount: "30.00", currencyCode: "USD" },
  total: { amount: "30.00", currencyCode: "USD" },
  lines: [],
};

const publicCart = {
  checkoutUrl: "https://store.example/cart/c/cart-123",
  totalQuantity: 2,
  subtotal: { amount: "30.00", currencyCode: "USD" },
  total: { amount: "30.00", currencyCode: "USD" },
  lines: [],
};

function assertPublicCartResponse(body: unknown, expected = publicCart): void {
  assert.deepEqual(body, { cart: expected });
  assert.equal("id" in (body as { cart: Record<string, unknown> }).cart, false);
}

function createOperations(overrides: Partial<{
  getCart: (cartId: string) => Promise<Cart | null>;
  createCart: (merchandiseId: string, quantity: number) => Promise<Cart>;
  addCartLine: (cartId: string, merchandiseId: string, quantity: number) => Promise<Cart>;
}> = {}) {
  return {
    getCart: async () => cart,
    createCart: async () => cart,
    addCartLine: async () => cart,
    ...overrides,
  };
}

function post(body: unknown): Request {
  return new Request("https://store.example/api/cart", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("GET returns a null cart when there is no cart session", async () => {
  const response = await GET.handle({
    cartId: undefined,
    operations: createOperations(),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { cart: null });
});

test("GET returns the normalized cart for an active session", async () => {
  const response = await GET.handle({
    cartId: "cart-123",
    operations: createOperations(),
  });

  assert.equal(response.status, 200);
  assertPublicCartResponse(await response.json());
});

test("GET clears an expired cart session", async () => {
  const response = await GET.handle({
    cartId: "expired-cart",
    operations: createOperations({ getCart: async () => null }),
  });

  assert.deepEqual(await response.json(), { cart: null });
  assert.match(response.headers.get("set-cookie") ?? "", /sai_cart_id=;/);
  assert.match(response.headers.get("set-cookie") ?? "", /Max-Age=0/);
});

test("POST rejects invalid cart input", async () => {
  const invalidBodies = [
    { merchandiseId: "   ", quantity: 1 },
    { merchandiseId: "variant-1", quantity: 1.5 },
    { merchandiseId: "variant-1", quantity: 0 },
    { merchandiseId: "variant-1", quantity: 100 },
    null,
    [],
    { merchandiseId: ["variant-1"], quantity: 1 },
    { merchandiseId: "variant-1", quantity: "1" },
    { merchandiseId: "variant-1", quantity: 1, unexpected: true },
  ];

  for (const body of invalidBodies) {
    const response = await POST.handle(post(body), {
      cartId: undefined,
      operations: createOperations(),
    });

    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, "INVALID_CART_INPUT");
  }
});

test("POST treats malformed JSON as invalid cart input", async () => {
  const response = await POST.handle(
    new Request("https://store.example/api/cart", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    }),
    { cartId: undefined, operations: createOperations() },
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: { code: "INVALID_CART_INPUT", message: "Cart input is invalid." },
  });
});

test("POST creates a cart and persists its server-only session", async () => {
  let createdWith: [string, number] | undefined;
  const response = await POST.handle(post({ merchandiseId: " variant-1 ", quantity: 2 }), {
    cartId: undefined,
    operations: createOperations({
      createCart: async (merchandiseId, quantity) => {
        createdWith = [merchandiseId, quantity];
        return cart;
      },
    }),
  });

  assert.equal(response.status, 200);
  assertPublicCartResponse(await response.json());
  assert.deepEqual(createdWith, ["variant-1", 2]);
  assert.match(response.headers.get("set-cookie") ?? "", /sai_cart_id=cart-123/);
  assert.match(response.headers.get("set-cookie") ?? "", /HttpOnly/);
});

test("POST adds a line to an active cart", async () => {
  let addedWith: [string, string, number] | undefined;
  const response = await POST.handle(post({ merchandiseId: "variant-2", quantity: 3 }), {
    cartId: "cart-123",
    operations: createOperations({
      addCartLine: async (cartId, merchandiseId, quantity) => {
        addedWith = [cartId, merchandiseId, quantity];
        return cart;
      },
    }),
  });

  assert.equal(response.status, 200);
  assertPublicCartResponse(await response.json());
  assert.deepEqual(addedWith, ["cart-123", "variant-2", 3]);
});

test("POST replaces an expired cart session with a newly created cart", async () => {
  const replacement = { ...cart, id: "cart-456" };
  const publicReplacement = { ...publicCart };
  const response = await POST.handle(post({ merchandiseId: "variant-1", quantity: 1 }), {
    cartId: "expired-cart",
    operations: createOperations({
      getCart: async () => null,
      createCart: async () => replacement,
    }),
  });

  assertPublicCartResponse(await response.json(), publicReplacement);
  assert.match(response.headers.get("set-cookie") ?? "", /sai_cart_id=cart-456/);
});

test("POST returns a generic error for Shopify user errors", async () => {
  const response = await POST.handle(post({ merchandiseId: "variant-1", quantity: 1 }), {
    cartId: undefined,
    operations: createOperations({
      createCart: async () => {
        throw new CartOperationError("OUT_OF_STOCK", "Internal Shopify detail");
      },
    }),
  });

  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), {
    error: { code: "CART_OPERATION_FAILED", message: "Cart operation failed." },
  });
});
