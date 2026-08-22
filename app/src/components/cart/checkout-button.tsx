import { Button, HStack, Link as ChakraLink, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import type { CartStatus } from "@/lib/cart/cart-state";
import type { PublicCart } from "@/types/cart";
import type { PolicyLink } from "@/types/policies";
import { getCheckoutDisclosure } from "./checkout-disclosure";

interface CheckoutButtonProps {
  cart: PublicCart | null;
  status: CartStatus;
  policies: PolicyLink[];
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

export function CheckoutButton({ cart, status, policies }: CheckoutButtonProps) {
  const checkoutHref = getCheckoutHref(cart);
  const disclosure = getCheckoutDisclosure(policies);

  if (checkoutHref === null || status === "mutating") {
    return null;
  }

  return (
    <Stack gap={3}>
      {disclosure ? (
        <Stack gap={2}>
          <Text fontSize="sm" color="fgMuted">
            {disclosure.message}
          </Text>
          <HStack gap={3} flexWrap="wrap">
            {disclosure.links.map((link) => (
              <ChakraLink asChild key={link.href} color="accentBright">
                <NextLink href={link.href}>{link.label}</NextLink>
              </ChakraLink>
            ))}
          </HStack>
        </Stack>
      ) : null}
      <Button asChild w="full">
        <a href={checkoutHref}>Proceed to checkout</a>
      </Button>
      <Text fontSize="sm" color="fgMuted">
        Payment and delivery details are completed securely in Shopify checkout.
      </Text>
    </Stack>
  );
}
