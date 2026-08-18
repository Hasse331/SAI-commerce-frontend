"use client";

import {
  Box,
  CloseButton,
  Flex,
  Heading,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { CartContent } from "./cart-content";

export function CartSidebar() {
  const { isOpen, closeCart, itemCount } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeButtonRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [closeCart, isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <Portal>
      <Box
        position="fixed"
        inset={0}
        bg="blackAlpha.700"
        zIndex={1400}
        onClick={closeCart}
      />

      <Box
        position="fixed"
        top={0}
        right={0}
        h="100vh"
        w={{ base: "100%", md: "420px" }}
        bg="bg"
        borderLeftWidth="1px"
        borderColor="border"
        zIndex={1401}
        boxShadow="-20px 0 40px rgba(0, 0, 0, 0.35)"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-sidebar-title"
        onClick={(event) => event.stopPropagation()}
      >
        <Flex
          align="center"
          justify="space-between"
          px={6}
          py={5}
          borderBottomWidth="1px"
          borderColor="border"
        >
          <Box>
            <Text textTransform="uppercase" fontSize="sm" color="accentBright">
              Cart
            </Text>
            <Heading id="cart-sidebar-title" as="h2" size="md">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </Heading>
          </Box>
          <CloseButton ref={closeButtonRef} aria-label="Close cart" onClick={closeCart} />
        </Flex>

        <Stack h="calc(100vh - 88px)" overflowY="auto" px={6} py={6}>
          <CartContent />
        </Stack>
      </Box>
    </Portal>
  );
}
