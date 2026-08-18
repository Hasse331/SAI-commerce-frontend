import assert from "node:assert/strict";
import test from "node:test";
import {
  CartOperationError,
  createCartOperations,
} from "./operations.ts";

function makeShopifyCart() {
  return {
    id: "gid://shopify/Cart/1",
    checkoutUrl: "https://store.example/cart/c/1?key=secure-key",
    totalQuantity: 1,
    cost: {
      subtotalAmount: { amount: "199.95", currencyCode: "USD" },
      totalAmount: { amount: "199.95", currencyCode: "USD" },
    },
    lines: {
      nodes: [
        {
          id: "gid://shopify/CartLine/1",
          quantity: 1,
          cost: {
            totalAmount: { amount: "199.95", currencyCode: "USD" },
          },
          merchandise: {
            id: "gid://shopify/ProductVariant/1",
            price: { amount: "199.95", currencyCode: "USD" },
            image: null,
            product: { handle: "reference-monitor", title: "Reference Monitor" },
          },
        },
      ],
    },
  };
}

test("cart operations send the documented cart input variables and map carts", async () => {
  const rawCart = makeShopifyCart();
  const calls: Array<{ query: string; variables?: Record<string, unknown> }> = [];
  const request = async <TData>(query: string, variables?: Record<string, unknown>) => {
    calls.push({ query, variables });

    if (query.includes("GetCart")) {
      return { cart: rawCart } as TData;
    }

    if (query.includes("CreateCart")) {
      return { cartCreate: { cart: rawCart, userErrors: [] } } as TData;
    }

    if (query.includes("AddCartLine")) {
      return { cartLinesAdd: { cart: rawCart, userErrors: [] } } as TData;
    }

    if (query.includes("UpdateCartLine")) {
      return { cartLinesUpdate: { cart: rawCart, userErrors: [] } } as TData;
    }

    return { cartLinesRemove: { cart: rawCart, userErrors: [] } } as TData;
  };
  const operations = createCartOperations(request);

  const results = await Promise.all([
    operations.getCart("gid://shopify/Cart/1"),
    operations.createCart("gid://shopify/ProductVariant/1", 2),
    operations.addCartLine(
      "gid://shopify/Cart/1",
      "gid://shopify/ProductVariant/1",
      3,
    ),
    operations.updateCartLine("gid://shopify/Cart/1", "gid://shopify/CartLine/1", 4),
    operations.removeCartLine("gid://shopify/Cart/1", "gid://shopify/CartLine/1"),
  ]);

  assert.equal(results[0]?.id, "gid://shopify/Cart/1");
  assert.equal(results[1].checkoutUrl, rawCart.checkoutUrl);
  assert.equal(results[2].lines[0].quantity, 1);
  assert.equal(results[3].total.amount, "199.95");
  assert.equal(results[4].subtotal.amount, "199.95");
  assert.deepEqual(
    calls.map((call) => call.variables),
    [
      { id: "gid://shopify/Cart/1" },
      {
        input: {
          lines: [{ merchandiseId: "gid://shopify/ProductVariant/1", quantity: 2 }],
        },
      },
      {
        cartId: "gid://shopify/Cart/1",
        lines: [{ merchandiseId: "gid://shopify/ProductVariant/1", quantity: 3 }],
      },
      {
        cartId: "gid://shopify/Cart/1",
        lines: [{ id: "gid://shopify/CartLine/1", quantity: 4 }],
      },
      {
        cartId: "gid://shopify/Cart/1",
        lineIds: ["gid://shopify/CartLine/1"],
      },
    ],
  );
});

test("getCart returns null when Shopify has no cart", async () => {
  const operations = createCartOperations(async () => ({ cart: null }));

  assert.equal(await operations.getCart("gid://shopify/Cart/expired"), null);
});

test("throws the first Shopify cart user error as a normalized error", async () => {
  const operations = createCartOperations(async () => ({
    cartLinesAdd: {
      cart: null,
      userErrors: [
        { code: "OUT_OF_STOCK", message: "Requested quantity is unavailable." },
        { code: "INVALID", message: "This error must not be used." },
      ],
    },
  }));

  await assert.rejects(
    operations.addCartLine(
      "gid://shopify/Cart/1",
      "gid://shopify/ProductVariant/1",
      1,
    ),
    (error: unknown) => {
      assert.ok(error instanceof CartOperationError);
      assert.equal(error.code, "OUT_OF_STOCK");
      assert.equal(error.message, "Requested quantity is unavailable.");
      return true;
    },
  );
});

test("throws MISSING_CART_RESPONSE for a mutation with no cart or user errors", async () => {
  const operations = createCartOperations(async () => ({
    cartCreate: { cart: null, userErrors: [] },
  }));

  await assert.rejects(
    operations.createCart("gid://shopify/ProductVariant/1", 1),
    (error: unknown) => {
      assert.ok(error instanceof CartOperationError);
      assert.equal(error.code, "MISSING_CART_RESPONSE");
      assert.equal(error.message, "Cart operation did not return a cart.");
      return true;
    },
  );
});
