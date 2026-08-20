"use client";

import { Button } from "@chakra-ui/react";
import { useCart } from "@/components/cart/cart-provider";

interface AddToCartButtonProps {
  merchandiseId: string;
  label: string;
}

export function AddToCartButton({
  merchandiseId,
  label,
}: AddToCartButtonProps) {
  const { addItem, status } = useCart();
  const isMutating = status === "mutating";

  return (
    <Button
      disabled={isMutating}
      onClick={() => void addItem(merchandiseId)}
    >
      {isMutating ? "Adding..." : label}
    </Button>
  );
}
