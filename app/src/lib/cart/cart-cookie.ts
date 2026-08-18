import type { NextResponse } from "next/server";

export const CART_COOKIE_NAME = "sai_cart_id";

export function getCartCookieOptions(nodeEnv = process.env.NODE_ENV) {
  return {
    name: CART_COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: nodeEnv === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export function setCartCookie(response: NextResponse, cartId: string): void {
  response.cookies.set({ ...getCartCookieOptions(), value: cartId });
}

export function deleteCartCookie(response: NextResponse): void {
  response.cookies.set({ ...getCartCookieOptions(), value: "", maxAge: 0 });
}
