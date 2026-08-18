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

function getDirectFieldSelection(source: string, fieldName: string): string {
  let depth = 0;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (character === "{") {
      depth += 1;
      continue;
    }

    if (character === "}") {
      depth -= 1;
      continue;
    }

    if (
      depth !== 0 ||
      !source.startsWith(fieldName, index) ||
      !/[\s({]/.test(source[index + fieldName.length] ?? "") ||
      (index > 0 && /[A-Za-z0-9_]/.test(source[index - 1]))
    ) {
      continue;
    }

    let cursor = index + fieldName.length;

    while (/\s/.test(source[cursor] ?? "")) {
      cursor += 1;
    }

    if (source[cursor] === "(") {
      let argumentDepth = 0;

      for (; cursor < source.length; cursor += 1) {
        if (source[cursor] === "(") {
          argumentDepth += 1;
        }

        if (source[cursor] === ")") {
          argumentDepth -= 1;

          if (argumentDepth === 0) {
            cursor += 1;
            break;
          }
        }
      }

      while (/\s/.test(source[cursor] ?? "")) {
        cursor += 1;
      }
    }

    if (source[cursor] !== "{") {
      continue;
    }

    return getRootSelection(source.slice(cursor));
  }

  throw new Error(`Missing direct ${fieldName} selection.`);
}

function getRootSelection(query: string): string {
  const openingBraceIndex = query.indexOf("{");

  if (openingBraceIndex === -1) {
    throw new Error("Operation has no selection set.");
  }

  let depth = 0;

  for (let index = openingBraceIndex; index < query.length; index += 1) {
    if (query[index] === "{") {
      depth += 1;
    }

    if (query[index] === "}") {
      depth -= 1;

      if (depth === 0) {
        return query.slice(openingBraceIndex + 1, index);
      }
    }
  }

  throw new Error("Operation has an unclosed selection set.");
}

function getInlineFragmentSelection(source: string, typeName: string): string {
  const marker = `... on ${typeName}`;
  let depth = 0;

  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === "{") {
      depth += 1;
      continue;
    }

    if (source[index] === "}") {
      depth -= 1;
      continue;
    }

    if (depth === 0 && source.startsWith(marker, index)) {
      return getRootSelection(source.slice(index));
    }
  }

  throw new Error(`Missing direct ${marker} fragment.`);
}

function directFieldNames(source: string): string[] {
  const fields: string[] = [];
  let depth = 0;

  for (const match of source.matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g)) {
    const index = match.index ?? 0;

    for (let cursor = 0; cursor < index; cursor += 1) {
      if (source[cursor] === "{") {
        depth += 1;
      }

      if (source[cursor] === "}") {
        depth -= 1;
      }
    }

    if (depth === 0) {
      fields.push(match[1]);
    }

    depth = 0;
  }

  return fields;
}

function assertDirectFields(source: string, expectedFields: string[]): void {
  const fields = directFieldNames(source);

  for (const field of expectedFields) {
    assert.ok(fields.includes(field), `Missing direct ${field} field.`);
  }
}

function assertCartSelection(cartSelection: string): void {
  assertDirectFields(cartSelection, ["id", "checkoutUrl", "totalQuantity", "cost", "lines"]);

  const costSelection = getDirectFieldSelection(cartSelection, "cost");
  const subtotalSelection = getDirectFieldSelection(costSelection, "subtotalAmount");
  const totalSelection = getDirectFieldSelection(costSelection, "totalAmount");
  const linesSelection = getDirectFieldSelection(cartSelection, "lines");
  const nodesSelection = getDirectFieldSelection(linesSelection, "nodes");
  const lineCostSelection = getDirectFieldSelection(nodesSelection, "cost");
  const lineTotalSelection = getDirectFieldSelection(lineCostSelection, "totalAmount");
  const merchandiseSelection = getDirectFieldSelection(nodesSelection, "merchandise");
  const variantSelection = getInlineFragmentSelection(
    merchandiseSelection,
    "ProductVariant",
  );

  assertDirectFields(subtotalSelection, ["amount", "currencyCode"]);
  assertDirectFields(totalSelection, ["amount", "currencyCode"]);
  assertDirectFields(nodesSelection, ["id", "quantity", "cost", "merchandise"]);
  assertDirectFields(lineTotalSelection, ["amount", "currencyCode"]);
  assertDirectFields(variantSelection, ["id", "price", "image", "product"]);
  assertDirectFields(getDirectFieldSelection(variantSelection, "price"), [
    "amount",
    "currencyCode",
  ]);
  assertDirectFields(getDirectFieldSelection(variantSelection, "image"), [
    "url",
    "altText",
  ]);
  assertDirectFields(getDirectFieldSelection(variantSelection, "product"), [
    "handle",
    "title",
  ]);
}

function getCartSelectionForOperation(query: string, operationField: string): string {
  const operationSelection = getDirectFieldSelection(
    getRootSelection(query),
    operationField,
  );
  const payloadSelection = operationField === "cart" ? operationSelection : getDirectFieldSelection(operationSelection, "cart");

  return payloadSelection;
}

test("cart operations send the documented cart input variables and map carts", async () => {
  const rawCart = makeShopifyCart();
  const calls: Array<{
    query: string;
    variables?: Record<string, unknown>;
    options?: { cache: "no-store" };
  }> = [];
  const request = async <TData>(
    query: string,
    variables?: Record<string, unknown>,
    options?: { cache: "no-store" },
  ) => {
    calls.push({ query, variables, options });

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
  assert.deepEqual(
    calls.map((call) => call.options),
    Array.from({ length: 5 }, () => ({ cache: "no-store" })),
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

test("prioritizes a Shopify user error even when the mutation also returns a cart", async () => {
  const operations = createCartOperations(async () => ({
    cartCreate: {
      cart: makeShopifyCart(),
      userErrors: [
        { code: "OUT_OF_STOCK", message: "Requested quantity is unavailable." },
      ],
    },
  }));

  await assert.rejects(
    operations.createCart("gid://shopify/ProductVariant/1", 1),
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

test("each cart operation requests the required nested cart selection", async () => {
  const rawCart = makeShopifyCart();
  const queries: string[] = [];
  const operations = createCartOperations(async <TData>(query: string) => {
    queries.push(query);

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
  });

  await Promise.all([
    operations.getCart("gid://shopify/Cart/1"),
    operations.createCart("gid://shopify/ProductVariant/1", 1),
    operations.addCartLine("gid://shopify/Cart/1", "gid://shopify/ProductVariant/1", 1),
    operations.updateCartLine("gid://shopify/Cart/1", "gid://shopify/CartLine/1", 1),
    operations.removeCartLine("gid://shopify/Cart/1", "gid://shopify/CartLine/1"),
  ]);

  assert.equal(queries.length, 5);
  assertCartSelection(getCartSelectionForOperation(queries[0], "cart"));
  assertCartSelection(getCartSelectionForOperation(queries[1], "cartCreate"));
  assertCartSelection(getCartSelectionForOperation(queries[2], "cartLinesAdd"));
  assertCartSelection(getCartSelectionForOperation(queries[3], "cartLinesUpdate"));
  assertCartSelection(getCartSelectionForOperation(queries[4], "cartLinesRemove"));

  const decoyQuery = `
    query GetCart($id: ID!) {
      decoy {
        cart {
          id checkoutUrl totalQuantity
          cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
          lines(first: 100) {
            nodes {
              id quantity cost { totalAmount { amount currencyCode } }
              merchandise {
                ... on ProductVariant {
                  id price { amount currencyCode } image { url altText } product { handle title }
                }
              }
            }
          }
        }
      }
      cart(id: $id) { id }
    }
  `;

  assert.throws(() => assertCartSelection(getCartSelectionForOperation(decoyQuery, "cart")));
});
