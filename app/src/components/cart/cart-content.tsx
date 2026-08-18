"use client";

import {
  Alert,
  Box,
  Button,
  HStack,
  Link as ChakraLink,
  Separator,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { CartLineItem } from "./cart-line-item";
import { formatCartMoney } from "./cart-presentation";

function CartLoadingSkeleton() {
  return (
    <Stack aria-busy="true" aria-label="Loading cart" gap={4}>
      <Skeleton h="120px" rounded="lg" />
      <Skeleton h="120px" rounded="lg" />
      <Skeleton h="56px" rounded="lg" />
    </Stack>
  );
}

export function CartContent() {
  const { cart, clearError, error, status } = useCart();

  if (status === "loading") {
    return <CartLoadingSkeleton />;
  }

  const lines = cart?.lines ?? [];
  const isMutating = status === "mutating";
  const hasError = status === "error" && error !== null;

  return (
    <Stack gap={6}>
      {hasError ? (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Cart update failed</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
          <Button size="sm" variant="ghost" onClick={clearError}>
            Dismiss
          </Button>
        </Alert.Root>
      ) : null}

      {cart === null || lines.length === 0 ? (
        <Box borderWidth="1px" borderColor="border" rounded="lg" p={5}>
          <Stack gap={3}>
            <Text>Your cart is empty.</Text>
            <ChakraLink asChild color="accentBright" fontWeight="semibold">
              <NextLink href="/products">Browse products</NextLink>
            </ChakraLink>
          </Stack>
        </Box>
      ) : (
        <>
          <Stack gap={4}>
            {lines.map((line) => (
              <CartLineItem key={line.id} line={line} disabled={isMutating} />
            ))}
          </Stack>

          <Box borderTopWidth="1px" borderColor="border" pt={5}>
            <Separator mb={4} />
            <HStack justify="space-between" gap={4}>
              <Text fontWeight="semibold">Subtotal</Text>
              <Text fontWeight="semibold">{formatCartMoney(cart.subtotal)}</Text>
            </HStack>
          </Box>
        </>
      )}
    </Stack>
  );
}
