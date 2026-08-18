import { NextResponse } from "next/server";

import type { Cart, PublicCart } from "@/types/cart";

export type CartErrorCode =
  | "INVALID_CART_INPUT"
  | "CART_OPERATION_FAILED"
  | "CART_SESSION_MISSING"
  | "CART_SESSION_EXPIRED";

export function toPublicCart(cart: Cart): PublicCart {
  return {
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    subtotal: cart.subtotal,
    total: cart.total,
    lines: cart.lines,
  };
}

export function cartResponse(cart: Cart | null, status = 200): NextResponse {
  return NextResponse.json(
    { cart: cart ? toPublicCart(cart) : null },
    { status },
  );
}

export function cartErrorResponse(
  code: CartErrorCode,
  message: string,
  status: number,
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}
