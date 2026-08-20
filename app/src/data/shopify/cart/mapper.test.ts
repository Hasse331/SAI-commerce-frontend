import assert from "node:assert/strict";
import test from "node:test";
import type { ShopifyCart } from "./types.ts";
import { mapShopifyCart } from "./mapper.ts";

function makeShopifyCart(): ShopifyCart {
  return {
    id: "gid://shopify/Cart/1",
    checkoutUrl: "https://store.example/cart/c/1?key=secure-key",
    totalQuantity: 2,
    cost: {
      subtotalAmount: { amount: "399.90", currencyCode: "USD" },
      totalAmount: { amount: "439.90", currencyCode: "USD" },
    },
    lines: {
      nodes: [
        {
          id: "gid://shopify/CartLine/1",
          quantity: 2,
          cost: {
            totalAmount: { amount: "399.90", currencyCode: "USD" },
          },
          merchandise: {
            id: "gid://shopify/ProductVariant/1",
            price: { amount: "199.95", currencyCode: "USD" },
            image: {
              url: "https://cdn.shopify.com/variant.png",
              altText: "Front view",
            },
            product: { handle: "reference-monitor", title: "Reference Monitor" },
          },
        },
      ],
    },
  };
}

test("maps populated Shopify cart fields into the application cart contract", () => {
  const cart = mapShopifyCart(makeShopifyCart());

  assert.deepEqual(cart, {
    id: "gid://shopify/Cart/1",
    checkoutUrl: "https://store.example/cart/c/1?key=secure-key",
    totalQuantity: 2,
    subtotal: { amount: "399.90", currencyCode: "USD" },
    total: { amount: "439.90", currencyCode: "USD" },
    lines: [
      {
        id: "gid://shopify/CartLine/1",
        merchandiseId: "gid://shopify/ProductVariant/1",
        quantity: 2,
        title: "Reference Monitor",
        slug: "reference-monitor",
        image: { src: "https://cdn.shopify.com/variant.png", alt: "Front view" },
        unitPrice: { amount: "199.95", currencyCode: "USD" },
        totalPrice: { amount: "399.90", currencyCode: "USD" },
      },
    ],
  });
});

test("maps a Shopify variant without an image to null", () => {
  const rawCart = makeShopifyCart();
  rawCart.lines.nodes[0].merchandise.image = null;

  assert.equal(mapShopifyCart(rawCart).lines[0].image, null);
});

test("maps an empty Shopify cart connection to no lines", () => {
  const rawCart = makeShopifyCart();
  rawCart.lines.nodes = [];

  assert.deepEqual(mapShopifyCart(rawCart).lines, []);
});

test("preserves Shopify money amounts as strings", () => {
  const cart = mapShopifyCart(makeShopifyCart());

  assert.equal(typeof cart.lines[0].unitPrice.amount, "string");
  assert.equal(typeof cart.lines[0].totalPrice.amount, "string");
  assert.equal(typeof cart.subtotal.amount, "string");
  assert.equal(typeof cart.total.amount, "string");
});
