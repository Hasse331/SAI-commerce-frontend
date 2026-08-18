import assert from "node:assert/strict";
import test from "node:test";

import {
  CartClientError,
  createCartClient,
  isCartSessionLoss,
} from "./cart-client";

const cart = {
  checkoutUrl: "https://store.example/cart/c/cart-123",
  totalQuantity: 2,
  subtotal: { amount: "30.00", currencyCode: "USD" },
  total: { amount: "30.00", currencyCode: "USD" },
  lines: [],
};

const cartWithLine = {
  ...cart,
  lines: [
    {
      id: "line-1",
      merchandiseId: "variant-1",
      quantity: 2,
      title: "Test product",
      slug: "test-product",
      image: { src: "https://cdn.example/product.jpg", alt: "Test product" },
      unitPrice: { amount: "15.00", currencyCode: "USD" },
      totalPrice: { amount: "30.00", currencyCode: "USD" },
    },
  ],
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("loadCart requests the current cart without caching", async () => {
  let received: [RequestInfo | URL, RequestInit | undefined] | undefined;
  const client = createCartClient(async (input, init) => {
    received = [input, init];
    return jsonResponse({ cart });
  });

  assert.deepEqual(await client.loadCart(), cart);
  assert.deepEqual(received, ["/api/cart", { method: "GET", cache: "no-store" }]);
});

test("loadCart accepts an explicit null cart", async () => {
  const client = createCartClient(async () => jsonResponse({ cart: null }));

  assert.equal(await client.loadCart(), null);
});

test("loadCart accepts a complete public cart and harmless extension fields", async () => {
  const extendedCart = {
    ...cartWithLine,
    notices: [{ code: "CART_WARNING", message: "Review this cart." }],
  };
  const client = createCartClient(async () => jsonResponse({ cart: extendedCart }));

  assert.deepEqual(await client.loadCart(), extendedCart);
});

test("addItem posts merchandise and quantity as JSON", async () => {
  let received: [RequestInfo | URL, RequestInit | undefined] | undefined;
  const client = createCartClient(async (input, init) => {
    received = [input, init];
    return jsonResponse({ cart });
  });

  assert.deepEqual(await client.addItem("variant-1", 3), cart);
  assert.deepEqual(received, [
    "/api/cart",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ merchandiseId: "variant-1", quantity: 3 }),
    },
  ]);
});

test("updateLine patches a line and quantity as JSON", async () => {
  let received: [RequestInfo | URL, RequestInit | undefined] | undefined;
  const client = createCartClient(async (input, init) => {
    received = [input, init];
    return jsonResponse({ cart });
  });

  assert.deepEqual(await client.updateLine("line-1", 4), cart);
  assert.deepEqual(received, [
    "/api/cart/lines",
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lineId: "line-1", quantity: 4 }),
    },
  ]);
});

test("removeLine sends the line ID in a DELETE JSON body", async () => {
  let received: [RequestInfo | URL, RequestInit | undefined] | undefined;
  const client = createCartClient(async (input, init) => {
    received = [input, init];
    return jsonResponse({ cart });
  });

  assert.deepEqual(await client.removeLine("line-1"), cart);
  assert.deepEqual(received, [
    "/api/cart/lines",
    {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lineId: "line-1" }),
    },
  ]);
});

test("non-OK API responses expose only the safe cart error", async () => {
  const client = createCartClient(async () =>
    jsonResponse(
      { error: { code: "CART_SESSION_EXPIRED", message: "Cart session has expired." } },
      409,
    ),
  );

  await assert.rejects(
    client.removeLine("line-1"),
    (error: unknown) => {
      assert.ok(error instanceof CartClientError);
      assert.equal(error.code, "CART_SESSION_EXPIRED");
      assert.equal(error.message, "Cart session has expired.");
      assert.equal(error.status, 409);
      assert.equal("response" in error, false);
      return true;
    },
  );
});

test("only missing and expired cart errors identify a lost cart session", () => {
  assert.equal(
    isCartSessionLoss(
      new CartClientError("CART_SESSION_MISSING", "Cart session is missing.", 409),
    ),
    true,
  );
  assert.equal(
    isCartSessionLoss(
      new CartClientError("CART_SESSION_EXPIRED", "Cart session has expired.", 409),
    ),
    true,
  );
  assert.equal(
    isCartSessionLoss(
      new CartClientError("CART_REQUEST_FAILED", "Cart request failed.", 0),
    ),
    false,
  );
  assert.equal(isCartSessionLoss(new Error("Cart session has expired.")), false);
});

test("malformed or nonconforming responses never expose response internals", async () => {
  const malformedClient = createCartClient(async () => new Response("{", { status: 500 }));
  const missingCartClient = createCartClient(async () => jsonResponse({ unexpected: true }));

  for (const operation of [malformedClient.loadCart(), missingCartClient.loadCart()]) {
    await assert.rejects(operation, (error: unknown) => {
      assert.ok(error instanceof CartClientError);
      assert.equal(error.code, "CART_RESPONSE_INVALID");
      assert.equal(error.message, "Cart response was invalid.");
      assert.equal("response" in error, false);
      return true;
    });
  }
});

test("successful responses reject malformed public cart fields", async () => {
  const malformedCarts: unknown[] = [
    false,
    {},
    { ...cart, checkoutUrl: null },
    { ...cart, totalQuantity: "2" },
    { ...cart, subtotal: { amount: 30, currencyCode: "USD" } },
    { ...cart, total: null },
    { ...cart, lines: {} },
    { ...cart, notices: [{ code: "CART_WARNING" }] },
    {
      ...cartWithLine,
      lines: [{ ...cartWithLine.lines[0], merchandiseId: undefined }],
    },
    {
      ...cartWithLine,
      lines: [{ ...cartWithLine.lines[0], quantity: 1.5 }],
    },
    {
      ...cartWithLine,
      lines: [{ ...cartWithLine.lines[0], image: { src: 1, alt: "Product" } }],
    },
  ];

  for (const malformedCart of malformedCarts) {
    const client = createCartClient(async () => jsonResponse({ cart: malformedCart }));

    await assert.rejects(client.loadCart(), (error: unknown) => {
      assert.ok(error instanceof CartClientError);
      assert.equal(error.code, "CART_RESPONSE_INVALID");
      assert.equal(error.message, "Cart response was invalid.");
      assert.equal("response" in error, false);
      return true;
    });
  }
});
