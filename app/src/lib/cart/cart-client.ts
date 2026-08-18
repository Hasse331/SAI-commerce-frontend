import type { PublicCart } from "@/types/cart";

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type CartResponse = {
  cart: PublicCart | null;
};

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
    throw new CartClientError(
      INVALID_RESPONSE_CODE,
      INVALID_RESPONSE_MESSAGE,
      response.status,
    );
  }

  if (!response.ok) {
    throw getApiError(body, response.status);
  }

  if (!isRecord(body) || !Object.hasOwn(body, "cart")) {
    throw new CartClientError(
      INVALID_RESPONSE_CODE,
      INVALID_RESPONSE_MESSAGE,
      response.status,
    );
  }

  return (body as CartResponse).cart;
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
