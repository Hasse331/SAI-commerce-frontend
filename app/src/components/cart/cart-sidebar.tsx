"use client";

import {
  Box,
  Button,
  CloseButton,
  Flex,
  Heading,
  Image,
  Portal,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useCart } from "@/components/cart/cart-provider";

export function CartSidebar() {
  const { isOpen, closeCart, itemCount, cart, removeLine } = useCart();
  const items = cart?.lines ?? [];

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
        w={{ base: "100%", sm: "420px" }}
        bg="bg"
        borderLeftWidth="1px"
        borderColor="border"
        zIndex={1401}
        boxShadow="-20px 0 40px rgba(0, 0, 0, 0.35)"
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
            <Heading as="h2" size="md">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </Heading>
          </Box>
          <CloseButton onClick={closeCart} />
        </Flex>

        <Stack h="calc(100vh - 88px)" justify="space-between" gap={0}>
          <Stack gap={4} overflowY="auto" px={6} py={6}>
            {items.length === 0 ? (
              <Box borderWidth="1px" rounded="lg" p={5}>
                <Text color="fgMuted">
                  Your cart is empty. Add a product to preview it here.
                </Text>
              </Box>
            ) : (
              items.map((item) => (
                <Box key={item.id} borderWidth="1px" rounded="lg" p={4}>
                  <Flex gap={4}>
                    <Box
                      w="92px"
                      h="92px"
                      p={3}
                      borderWidth="1px"
                      rounded="md"
                      flexShrink={0}
                    >
                      <Image
                        src={item.image?.src ?? "/globe.svg"}
                        alt={item.image?.alt ?? item.title}
                        w="full"
                        h="full"
                        objectFit="contain"
                      />
                    </Box>

                    <Flex flex="1" justify="space-between" gap={4}>
                      <Box>
                        <Heading as="h3" size="sm" mb={2}>
                          {item.title}
                        </Heading>
                        <Text fontSize="sm" color="fgMuted">
                          {item.unitPrice.amount} {item.unitPrice.currencyCode}
                        </Text>
                        <Text fontSize="sm">Qty: {item.quantity}</Text>
                      </Box>

                      <Button
                        variant="ghost"
                        size="sm"
                        alignSelf="start"
                        onClick={() => void removeLine(item.id)}
                      >
                        Remove
                      </Button>
                    </Flex>
                  </Flex>
                </Box>
              ))
            )}
          </Stack>

          <Box px={6} py={5} borderTopWidth="1px" borderColor="border">
            <Separator mb={4} />
            <Text fontSize="sm" color="fgMuted" mb={4}>
              This is an early cart sidebar preview. Checkout flow comes later.
            </Text>
            <Button w="full" onClick={closeCart}>
              Continue browsing
            </Button>
          </Box>
        </Stack>
      </Box>
    </Portal>
  );
}
