import { Button, Stack, Text } from "@chakra-ui/react";
import type { CartStatus } from "@/lib/cart/cart-state";
import type { PublicCart } from "@/types/cart";

interface CheckoutButtonProps {
  cart: PublicCart | null;
  status: CartStatus;
}

export function getCheckoutHref(cart: PublicCart | null): string | null {
  if (
    cart === null ||
    cart.lines.length === 0 ||
    !(cart.totalQuantity > 0) ||
    /[\u0000-\u0020\\]/.test(cart.checkoutUrl)
  ) {
    return null;
  }

  try {
    const checkoutUrl = new URL(cart.checkoutUrl);

    if (checkoutUrl.protocol !== "https:" || checkoutUrl.href !== cart.checkoutUrl) {
      return null;
    }
  } catch {
    return null;
  }

  return cart.checkoutUrl;
}

export function CheckoutButton({ cart, status }: CheckoutButtonProps) {
  const checkoutHref = getCheckoutHref(cart);

  if (checkoutHref === null || status === "mutating") {
    return null;
  }

  return (
    <Stack gap={3}>
      <Button asChild w="full">
        <a href={checkoutHref}>Proceed to checkout</a>
      </Button>
      <Text fontSize="sm" color="fgMuted">
        Payment and delivery details are completed securely in Shopify checkout.
      </Text>
    </Stack>
  );
}
