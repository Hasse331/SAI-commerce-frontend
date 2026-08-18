import type { Cart, CartNotice } from "@/types/cart";
import {
  storefrontQuery,
  type StorefrontRequestOptions,
} from "../storefront-client";
import { mapShopifyCart } from "./mapper";
import type { ShopifyCart, ShopifyCartMutationPayload } from "./types";

export type StorefrontRequest = <TData>(
  query: string,
  variables?: Record<string, unknown>,
  options?: StorefrontRequestOptions,
) => Promise<TData>;

const cartRequestOptions = { cache: "no-store" } as const;

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
      warnings { code message target }
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
      warnings { code message target }
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
      warnings { code message target }
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
      warnings { code message target }
    }
  }
`;

function normalizeCartWarning(code: string): CartNotice {
  if (code === "MERCHANDISE_NOT_ENOUGH_STOCK") {
    return {
      code,
      message: "The requested quantity was adjusted because stock is limited.",
    };
  }

  if (code === "MERCHANDISE_OUT_OF_STOCK") {
    return {
      code,
      message: "An out-of-stock item was removed or adjusted.",
    };
  }

  if (code === "PRODUCT_UNAVAILABLE_IN_BUYER_LOCATION") {
    return {
      code,
      message: "An item is unavailable in the selected buyer location.",
    };
  }

  if (code.startsWith("DISCOUNT_")) {
    return {
      code,
      message: "A discount could not be applied. Please review the cart at checkout.",
    };
  }

  return {
    code: "CART_UPDATED_WITH_WARNING",
    message: "Shopify adjusted the cart. Please review it before checkout.",
  };
}

function mapMutationCart(payload: ShopifyCartMutationPayload): Cart {
  const userError = payload.userErrors[0];

  if (userError) {
    throw new CartOperationError(
      userError.code || "CART_OPERATION_FAILED",
      userError.message || "Cart operation failed.",
    );
  }

  if (payload.cart) {
    const cart = mapShopifyCart(payload.cart);
    const notices = (payload.warnings ?? []).map((warning) =>
      normalizeCartWarning(warning.code),
    );

    return notices.length > 0 ? { ...cart, notices } : cart;
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
    const data = await request<ShopifyGetCartData>(
      getCartQuery,
      { id: cartId },
      cartRequestOptions,
    );

    return data.cart ? mapShopifyCart(data.cart) : null;
  }

  async function createCart(
    merchandiseId: string,
    quantity: number,
  ): Promise<Cart> {
    const data = await request<ShopifyCreateCartData>(
      createCartMutation,
      {
        input: {
          lines: [{ merchandiseId, quantity }],
        },
      },
      cartRequestOptions,
    );

    return mapMutationCart(data.cartCreate);
  }

  async function addCartLine(
    cartId: string,
    merchandiseId: string,
    quantity: number,
  ): Promise<Cart> {
    const data = await request<ShopifyAddCartLineData>(
      addCartLineMutation,
      {
        cartId,
        lines: [{ merchandiseId, quantity }],
      },
      cartRequestOptions,
    );

    return mapMutationCart(data.cartLinesAdd);
  }

  async function updateCartLine(
    cartId: string,
    lineId: string,
    quantity: number,
  ): Promise<Cart> {
    const data = await request<ShopifyUpdateCartLineData>(
      updateCartLineMutation,
      {
        cartId,
        lines: [{ id: lineId, quantity }],
      },
      cartRequestOptions,
    );

    return mapMutationCart(data.cartLinesUpdate);
  }

  async function removeCartLine(cartId: string, lineId: string): Promise<Cart> {
    const data = await request<ShopifyRemoveCartLineData>(
      removeCartLineMutation,
      {
        cartId,
        lineIds: [lineId],
      },
      cartRequestOptions,
    );

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
