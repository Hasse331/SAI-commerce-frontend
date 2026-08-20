import type { PublicCart } from "@/types/cart";

export type CartStatus = "loading" | "ready" | "mutating" | "error";

export interface CartState {
  cart: PublicCart | null;
  status: CartStatus;
  error: string | null;
  isOpen: boolean;
}

type CartStateAction =
  | { type: "loadSucceeded"; cart: PublicCart | null }
  | { type: "mutationStarted" }
  | { type: "mutationSucceeded"; cart: PublicCart | null }
  | { type: "addSucceeded"; cart: PublicCart | null }
  | { type: "mutationFailed"; error: string }
  | { type: "sessionFailed"; error: string }
  | { type: "clearError" }
  | { type: "opened" }
  | { type: "closed" };

export const initialCartState: CartState = {
  cart: null,
  status: "loading",
  error: null,
  isOpen: false,
};

export function cartStateReducer(state: CartState, action: CartStateAction): CartState {
  switch (action.type) {
    case "loadSucceeded":
    case "mutationSucceeded":
      return { ...state, cart: action.cart, status: "ready", error: null };
    case "addSucceeded":
      return { ...state, cart: action.cart, status: "ready", error: null, isOpen: true };
    case "mutationStarted":
      return { ...state, status: "mutating", error: null };
    case "mutationFailed":
      return { ...state, status: "error", error: action.error };
    case "sessionFailed":
      return { ...state, cart: null, status: "error", error: action.error };
    case "clearError":
      return { ...state, status: "ready", error: null };
    case "opened":
      return { ...state, isOpen: true };
    case "closed":
      return { ...state, isOpen: false };
  }
}
