import assert from "node:assert/strict";
import test from "node:test";

import { getCartCookieOptions } from "./cart-cookie";

test("uses secure HTTP-only options for production cart sessions", () => {
  const options = getCartCookieOptions("production");

  assert.deepEqual(options, {
    name: "sai_cart_id",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
});

test("does not require HTTPS for development cart sessions", () => {
  const options = getCartCookieOptions("development");

  assert.deepEqual(options, {
    name: "sai_cart_id",
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
});
