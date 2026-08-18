import type { CartLine, Money, PublicCart } from "@/types/cart";

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const INVALID_RESPONSE_CODE = "CART_RESPONSE_INVALID";
const INVALID_RESPONSE_MESSAGE = "Cart response was invalid.";

export class CartClientError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "CartClientError";
    this.code = code;
    this.status = status;
  }
}

export function isCartSessionLoss(error: unknown): error is CartClientError {
  return (
    error instanceof CartClientError &&
    (error.code === "CART_SESSION_MISSING" || error.code === "CART_SESSION_EXPIRED")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMoney(value: unknown): value is Money {
  return (
    isRecord(value) &&
    typeof value.amount === "string" &&
    typeof value.currencyCode === "string"
  );
}

function isCartLine(value: unknown): value is CartLine {
  if (!isRecord(value)) {
    return false;
  }

  const hasValidImage =
    value.image === null ||
    (isRecord(value.image) &&
      typeof value.image.src === "string" &&
      typeof value.image.alt === "string");

  return (
    typeof value.id === "string" &&
    typeof value.merchandiseId === "string" &&
    typeof value.quantity === "number" &&
    Number.isInteger(value.quantity) &&
    value.quantity > 0 &&
    typeof value.title === "string" &&
    typeof value.slug === "string" &&
    hasValidImage &&
    isMoney(value.unitPrice) &&
    isMoney(value.totalPrice)
  );
}

function hasValidNotices(value: Record<string, unknown>): boolean {
  if (!Object.hasOwn(value, "notices")) {
    return true;
  }

  return (
    Array.isArray(value.notices) &&
    value.notices.every(
      (notice) =>
        isRecord(notice) &&
        typeof notice.code === "string" &&
        typeof notice.message === "string",
    )
  );
}

function isPublicCart(value: unknown): value is PublicCart {
  return (
    isRecord(value) &&
    typeof value.checkoutUrl === "string" &&
    typeof value.totalQuantity === "number" &&
    Number.isInteger(value.totalQuantity) &&
    value.totalQuantity >= 0 &&
    isMoney(value.subtotal) &&
    isMoney(value.total) &&
    Array.isArray(value.lines) &&
    value.lines.every(isCartLine) &&
    hasValidNotices(value)
  );
}

function invalidResponse(status: number): CartClientError {
  return new CartClientError(
    INVALID_RESPONSE_CODE,
    INVALID_RESPONSE_MESSAGE,
    status,
  );
}

function getApiError(body: unknown, status: number): CartClientError {
  if (
    isRecord(body) &&
    isRecord(body.error) &&
    typeof body.error.code === "string" &&
    typeof body.error.message === "string"
  ) {
    return new CartClientError(body.error.code, body.error.message, status);
  }

  return new CartClientError(INVALID_RESPONSE_CODE, INVALID_RESPONSE_MESSAGE, status);
}

async function readCartResponse(response: Response): Promise<PublicCart | null> {
  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw invalidResponse(response.status);
  }

  if (!response.ok) {
    throw getApiError(body, response.status);
  }

  if (!isRecord(body) || !Object.hasOwn(body, "cart")) {
    throw invalidResponse(response.status);
  }

  if (body.cart !== null && !isPublicCart(body.cart)) {
    throw invalidResponse(response.status);
  }

  return body.cart;
}

async function requestCart(
  fetcher: Fetcher,
  path: string,
  init: RequestInit,
): Promise<PublicCart | null> {
  try {
    return await readCartResponse(await fetcher(path, init));
  } catch (error) {
    if (error instanceof CartClientError) {
      throw error;
    }

    throw new CartClientError("CART_REQUEST_FAILED", "Cart request failed.", 0);
  }
}

export function createCartClient(fetcher: Fetcher) {
  return {
    loadCart: () => requestCart(fetcher, "/api/cart", { method: "GET", cache: "no-store" }),
    addItem: (merchandiseId: string, quantity = 1) =>
      requestCart(fetcher, "/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ merchandiseId, quantity }),
      }),
    updateLine: (lineId: string, quantity: number) =>
      requestCart(fetcher, "/api/cart/lines", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lineId, quantity }),
      }),
    removeLine: (lineId: string) =>
      requestCart(fetcher, "/api/cart/lines", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lineId }),
      }),
  };
}

export const cartClient = createCartClient(fetch);
