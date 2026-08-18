import { cookies } from "next/headers";

import {
  CartOperationError,
  addCartLine,
  createCart,
  getCart,
} from "@/data/shopify/cart/operations";
import { CART_COOKIE_NAME, deleteCartCookie, setCartCookie } from "@/lib/cart/cart-cookie";
import { cartErrorResponse, cartResponse } from "@/lib/cart/cart-response";
import type { Cart } from "@/types/cart";

type CartOperations = {
  getCart(cartId: string): Promise<Cart | null>;
  createCart(merchandiseId: string, quantity: number): Promise<Cart>;
  addCartLine(cartId: string, merchandiseId: string, quantity: number): Promise<Cart>;
};

export interface CartRouteDependencies {
  cartId: string | undefined;
  operations: CartOperations;
}

type CartInput = {
  merchandiseId: string;
  quantity: number;
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

function parseCartInput(body: unknown): CartInput | null {
  if (!isRecord(body) || !hasOnlyKeys(body, ["merchandiseId", "quantity"])) {
    return null;
  }

  const { merchandiseId, quantity } = body;

  if (
    typeof merchandiseId !== "string" ||
    !merchandiseId.trim() ||
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 99
  ) {
    return null;
  }

  return { merchandiseId: merchandiseId.trim(), quantity };
}

async function readCartInput(request: Request): Promise<CartInput | null> {
  try {
    return parseCartInput(await request.json());
  } catch {
    return null;
  }
}

async function handleGetCart({
  cartId,
  operations,
}: CartRouteDependencies) {
  if (!cartId) {
    return cartResponse(null);
  }

  try {
    const cart = await operations.getCart(cartId);
    const response = cartResponse(cart);

    if (!cart) {
      deleteCartCookie(response);
    }

    return response;
  } catch (error) {
    return cartOperationFailure(error);
  }
}

async function handlePostCart(
  request: Request,
  { cartId, operations }: CartRouteDependencies,
) {
  const input = await readCartInput(request);

  if (!input) {
    return invalidCartInput("Cart input is invalid.");
  }

  try {
    const existingCart = cartId ? await operations.getCart(cartId) : null;
    const cart = existingCart
      ? await operations.addCartLine(cartId as string, input.merchandiseId, input.quantity)
      : await operations.createCart(input.merchandiseId, input.quantity);
    const response = cartResponse(cart);

    if (!existingCart) {
      setCartCookie(response, cart.id);
    }

    return response;
  } catch (error) {
    return cartOperationFailure(error);
  }
}

export const GET = Object.assign(
  async function GET() {
    const cookieStore = await cookies();

    return handleGetCart({
      cartId: cookieStore.get(CART_COOKIE_NAME)?.value,
      operations: { getCart, createCart, addCartLine },
    });
  },
  { handle: handleGetCart },
);

export const POST = Object.assign(
  async function POST(request: Request) {
    const cookieStore = await cookies();

    return handlePostCart(request, {
      cartId: cookieStore.get(CART_COOKIE_NAME)?.value,
      operations: { getCart, createCart, addCartLine },
    });
  },
  { handle: handlePostCart },
);
