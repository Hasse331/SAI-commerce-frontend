"use client";

import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useCart } from "@/components/cart/cart-provider";
import { CartContent } from "./cart-content";

export function CartSidebar() {
  const { isOpen, closeCart, itemCount } = useCart();

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) {
          closeCart();
        }
      }}
      modal
      trapFocus
      restoreFocus
      closeOnEscape
      closeOnInteractOutside
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.700" zIndex={1400} />
        <Dialog.Positioner
          inset={0}
          zIndex={1401}
          display="flex"
          justifyContent="flex-end"
          alignItems="stretch"
        >
          <Dialog.Content
            h="100vh"
            w={{ base: "100%", md: "420px" }}
            maxW="none"
            m={0}
            rounded="none"
            bg="bg"
            borderLeftWidth="1px"
            borderColor="border"
            boxShadow="-20px 0 40px rgba(0, 0, 0, 0.35)"
            overflow="hidden"
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
                <Dialog.Title fontSize="lg" fontWeight="semibold">
                  {itemCount} item{itemCount === 1 ? "" : "s"}
                </Dialog.Title>
              </Box>
              <Dialog.CloseTrigger asChild>
                <CloseButton aria-label="Close cart" />
              </Dialog.CloseTrigger>
            </Flex>

            <Dialog.Body p={0}>
              <Stack h="calc(100vh - 88px)" overflowY="auto" px={6} py={6}>
                <CartContent />
              </Stack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
