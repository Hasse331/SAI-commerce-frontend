import type { Money } from "@/types/cart";

const minimumCartQuantity = 1;
const maximumCartQuantity = 99;

export function formatCartMoney({ amount, currencyCode }: Money): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

export function getCartQuantityPresentation(quantity: number): {
  quantity: number;
  canIncrement: boolean;
} {
  return {
    quantity,
    canIncrement: quantity < maximumCartQuantity,
  };
}

export function getDecrementAction(
  quantity: number,
): { type: "remove" } | { type: "update"; quantity: number } {
  if (quantity <= minimumCartQuantity) {
    return { type: "remove" };
  }

  return { type: "update", quantity: quantity - 1 };
}
