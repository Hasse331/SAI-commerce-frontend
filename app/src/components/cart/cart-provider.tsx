"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { CartClientError, cartClient } from "@/lib/cart/cart-client";
import {
  cartStateReducer,
  initialCartState,
  type CartStatus,
} from "@/lib/cart/cart-state";
import { createCartAsync, type CartAsync } from "@/lib/cart/cart-async";
import type { PublicCart } from "@/types/cart";

interface CartContextValue {
  cart: PublicCart | null;
  itemCount: number;
  status: CartStatus;
  error: string | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  clearError: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function errorMessage(error: unknown): string {
  return error instanceof CartClientError ? error.message : "Cart request failed.";
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartStateReducer, initialCartState);
  const isMountedRef = useRef(false);
  const requestIdRef = useRef(0);
  const cartAsyncRef = useRef<CartAsync<PublicCart | null> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    const requestId = ++requestIdRef.current;
    let isActive = true;

    if (cartAsyncRef.current == null) {
      cartAsyncRef.current = createCartAsync<PublicCart | null>();
    }

    const cartAsync = cartAsyncRef.current;

    void (async () => {
      try {
        const cart = await cartAsync.acquireInitialLoad(() => cartClient.loadCart());

        if (isActive && isMountedRef.current && requestId === requestIdRef.current) {
          dispatch({ type: "loadSucceeded", cart });
        }
      } catch (error) {
        if (isActive && isMountedRef.current && requestId === requestIdRef.current) {
          dispatch({ type: "mutationFailed", error: errorMessage(error) });
        }
      }
    })();

    return () => {
      isActive = false;
      isMountedRef.current = false;
    };
  }, []);

  const runMutation = useCallback(
    async (operation: () => Promise<PublicCart | null>, opensCart = false) => {
      const cartAsync = cartAsyncRef.current;

      if (cartAsync == null) {
        return;
      }

      const requestId = ++requestIdRef.current;
      dispatch({ type: "mutationStarted" });

      try {
        const cart = await cartAsync.enqueueMutation(operation);

        if (isMountedRef.current && requestId === requestIdRef.current) {
          dispatch({ type: opensCart ? "addSucceeded" : "mutationSucceeded", cart });
        }
      } catch (error) {
        if (isMountedRef.current && requestId === requestIdRef.current) {
          dispatch({ type: "mutationFailed", error: errorMessage(error) });
        }
      }
    },
    [],
  );

  const addItem = useCallback(
    async (merchandiseId: string, quantity = 1) =>
      runMutation(() => cartClient.addItem(merchandiseId, quantity), true),
    [runMutation],
  );
  const updateLine = useCallback(
    async (lineId: string, quantity: number) =>
      runMutation(() => cartClient.updateLine(lineId, quantity)),
    [runMutation],
  );
  const removeLine = useCallback(
    async (lineId: string) => runMutation(() => cartClient.removeLine(lineId)),
    [runMutation],
  );
  const openCart = useCallback(() => dispatch({ type: "opened" }), []);
  const closeCart = useCallback(() => dispatch({ type: "closed" }), []);
  const clearError = useCallback(() => dispatch({ type: "clearError" }), []);
  const itemCount = state.cart?.totalQuantity ?? 0;

  const value = useMemo<CartContextValue>(
    () => ({
      cart: state.cart,
      itemCount,
      status: state.status,
      error: state.error,
      isOpen: state.isOpen,
      openCart,
      closeCart,
      addItem,
      updateLine,
      removeLine,
      clearError,
    }),
    [addItem, clearError, closeCart, itemCount, openCart, removeLine, state, updateLine],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
