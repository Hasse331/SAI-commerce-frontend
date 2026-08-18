import { cookies } from "next/headers";

import {
  CartOperationError,
  getCart,
  removeCartLine,
  updateCartLine,
} from "@/data/shopify/cart/operations";
import { CART_COOKIE_NAME, deleteCartCookie } from "@/lib/cart/cart-cookie";
import { cartErrorResponse, cartResponse } from "@/lib/cart/cart-response";
import type { Cart } from "@/types/cart";

type CartLineOperations = {
  getCart(cartId: string): Promise<Cart | null>;
  updateCartLine(cartId: string, lineId: string, quantity: number): Promise<Cart>;
  removeCartLine(cartId: string, lineId: string): Promise<Cart>;
};

export interface CartLineRouteDependencies {
  cartId: string | undefined;
  operations: CartLineOperations;
}

type CartLineInput = {
  lineId: string;
  quantity?: number;
};

function invalidCartInput(message: string) {
  return cartErrorResponse("INVALID_CART_INPUT", message, 400);
}

function cartOperationFailure(error: unknown) {
  const status = error instanceof CartOperationError ? 422 : 500;

  return cartErrorResponse("CART_OPERATION_FAILED", "Cart operation failed.", status);
}

function hasOnlyKeys(body: Record<string, unknown>, keys: string[]): boolean {
  return Object.keys(body).every((key) => keys.includes(key));
}

function isRecord(body: unknown): body is Record<string, unknown> {
  return typeof body === "object" && body !== null && !Array.isArray(body);
}

function parseCartLineInput(body: unknown, requiresQuantity: boolean): CartLineInput | null {
  if (
    !isRecord(body) ||
    !hasOnlyKeys(body, requiresQuantity ? ["lineId", "quantity"] : ["lineId"])
  ) {
    return null;
  }

  const { lineId, quantity } = body;

  if (typeof lineId !== "string" || !lineId.trim()) {
    return null;
  }

  if (
    requiresQuantity &&
    (typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 99)
  ) {
    return null;
  }

  return { lineId: lineId.trim(), quantity: requiresQuantity ? quantity as number : undefined };
}

async function readCartLineInput(
  request: Request,
  requiresQuantity: boolean,
): Promise<CartLineInput | null> {
  try {
    return parseCartLineInput(await request.json(), requiresQuantity);
  } catch {
    return null;
  }
}

async function getActiveCart(
  cartId: string | undefined,
  operations: CartLineOperations,
) {
  if (!cartId) {
    return { error: cartErrorResponse("CART_SESSION_MISSING", "Cart session is missing.", 409) };
  }

  const cart = await operations.getCart(cartId);

  if (!cart) {
    const response = cartErrorResponse("CART_SESSION_EXPIRED", "Cart session has expired.", 409);
    deleteCartCookie(response);
    return { error: response };
  }

  return { cart };
}

async function handlePatchCartLine(
  request: Request,
  { cartId, operations }: CartLineRouteDependencies,
) {
  if (!cartId) {
    return cartErrorResponse("CART_SESSION_MISSING", "Cart session is missing.", 409);
  }

  try {
    const activeCart = await getActiveCart(cartId, operations);

    if ("error" in activeCart) {
      return activeCart.error;
    }

    const input = await readCartLineInput(request, true);

    if (!input || input.quantity === undefined) {
      return invalidCartInput("Cart line input is invalid.");
    }

    return cartResponse(
      await operations.updateCartLine(activeCart.cart.id, input.lineId, input.quantity),
    );
  } catch (error) {
    return cartOperationFailure(error);
  }
}

async function handleDeleteCartLine(
  request: Request,
  { cartId, operations }: CartLineRouteDependencies,
) {
  if (!cartId) {
    return cartErrorResponse("CART_SESSION_MISSING", "Cart session is missing.", 409);
  }

  try {
    const activeCart = await getActiveCart(cartId, operations);

    if ("error" in activeCart) {
      return activeCart.error;
    }

    const input = await readCartLineInput(request, false);

    if (!input) {
      return invalidCartInput("Cart line input is invalid.");
    }

    return cartResponse(await operations.removeCartLine(activeCart.cart.id, input.lineId));
  } catch (error) {
    return cartOperationFailure(error);
  }
}

export const PATCH = Object.assign(
  async function PATCH(request: Request) {
    const cookieStore = await cookies();

    return handlePatchCartLine(request, {
      cartId: cookieStore.get(CART_COOKIE_NAME)?.value,
      operations: { getCart, updateCartLine, removeCartLine },
    });
  },
  { handle: handlePatchCartLine },
);

export const DELETE = Object.assign(
  async function DELETE(request: Request) {
    const cookieStore = await cookies();

    return handleDeleteCartLine(request, {
      cartId: cookieStore.get(CART_COOKIE_NAME)?.value,
      operations: { getCart, updateCartLine, removeCartLine },
    });
  },
  { handle: handleDeleteCartLine },
);
