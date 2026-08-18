import type { Cart } from "@/types/cart";
import { storefrontQuery } from "../storefront-client";
import { mapShopifyCart } from "./mapper";
import type { ShopifyCart, ShopifyCartMutationPayload } from "./types";

export type StorefrontRequest = <TData>(
  query: string,
  variables?: Record<string, unknown>,
) => Promise<TData>;

export class CartOperationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "CartOperationError";
  }
}

const cartSelection = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount { amount currencyCode }
    totalAmount { amount currencyCode }
  }
  lines(first: 100) {
    nodes {
      id
      quantity
      cost { totalAmount { amount currencyCode } }
      merchandise {
        ... on ProductVariant {
          id
          price { amount currencyCode }
          image { url altText }
          product { handle title }
        }
      }
    }
  }
`;

const getCartQuery = `
  query GetCart($id: ID!) {
    cart(id: $id) {
      ${cartSelection}
    }
  }
`;

const createCartMutation = `
  mutation CreateCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ${cartSelection}
      }
      userErrors { code message }
    }
  }
`;

const addCartLineMutation = `
  mutation AddCartLine($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ${cartSelection}
      }
      userErrors { code message }
    }
  }
`;

const updateCartLineMutation = `
  mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ${cartSelection}
      }
      userErrors { code message }
    }
  }
`;

const removeCartLineMutation = `
  mutation RemoveCartLine($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ${cartSelection}
      }
      userErrors { code message }
    }
  }
`;

function mapMutationCart(payload: ShopifyCartMutationPayload): Cart {
  const userError = payload.userErrors[0];

  if (userError) {
    throw new CartOperationError(
      userError.code || "CART_OPERATION_FAILED",
      userError.message || "Cart operation failed.",
    );
  }

  if (payload.cart) {
    return mapShopifyCart(payload.cart);
  }

  throw new CartOperationError(
    "MISSING_CART_RESPONSE",
    "Cart operation did not return a cart.",
  );
}

interface ShopifyGetCartData {
  cart: ShopifyCart | null;
}

interface ShopifyCreateCartData {
  cartCreate: ShopifyCartMutationPayload;
}

interface ShopifyAddCartLineData {
  cartLinesAdd: ShopifyCartMutationPayload;
}

interface ShopifyUpdateCartLineData {
  cartLinesUpdate: ShopifyCartMutationPayload;
}

interface ShopifyRemoveCartLineData {
  cartLinesRemove: ShopifyCartMutationPayload;
}

export function createCartOperations(request: StorefrontRequest) {
  async function getCart(cartId: string): Promise<Cart | null> {
    const data = await request<ShopifyGetCartData>(getCartQuery, { id: cartId });

    return data.cart ? mapShopifyCart(data.cart) : null;
  }

  async function createCart(
    merchandiseId: string,
    quantity: number,
  ): Promise<Cart> {
    const data = await request<ShopifyCreateCartData>(createCartMutation, {
      input: {
        lines: [{ merchandiseId, quantity }],
      },
    });

    return mapMutationCart(data.cartCreate);
  }

  async function addCartLine(
    cartId: string,
    merchandiseId: string,
    quantity: number,
  ): Promise<Cart> {
    const data = await request<ShopifyAddCartLineData>(addCartLineMutation, {
      cartId,
      lines: [{ merchandiseId, quantity }],
    });

    return mapMutationCart(data.cartLinesAdd);
  }

  async function updateCartLine(
    cartId: string,
    lineId: string,
    quantity: number,
  ): Promise<Cart> {
    const data = await request<ShopifyUpdateCartLineData>(updateCartLineMutation, {
      cartId,
      lines: [{ id: lineId, quantity }],
    });

    return mapMutationCart(data.cartLinesUpdate);
  }

  async function removeCartLine(cartId: string, lineId: string): Promise<Cart> {
    const data = await request<ShopifyRemoveCartLineData>(removeCartLineMutation, {
      cartId,
      lineIds: [lineId],
    });

    return mapMutationCart(data.cartLinesRemove);
  }

  return { getCart, createCart, addCartLine, updateCartLine, removeCartLine };
}

export const {
  getCart,
  createCart,
  addCartLine,
  updateCartLine,
  removeCartLine,
} = createCartOperations(storefrontQuery);
