"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  Image,
  Link as ChakraLink,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import {
  formatCartMoney,
  getCartQuantityPresentation,
  getDecrementAction,
} from "./cart-presentation";
import type { CartLine } from "@/types/cart";

interface CartLineItemProps {
  line: CartLine;
  disabled: boolean;
}

export function CartLineItem({ line, disabled }: CartLineItemProps) {
  const { removeLine, updateLine } = useCart();
  const { quantity, canIncrement } = getCartQuantityPresentation(line.quantity);

  const handleDecrement = () => {
    const action = getDecrementAction(quantity);

    if (action.type === "remove") {
      void removeLine(line.id);
      return;
    }

    void updateLine(line.id, action.quantity);
  };

  return (
    <Flex
      as="article"
      gap={4}
      p={{ base: 3, md: 4 }}
      borderWidth="1px"
      borderColor="border"
      rounded="lg"
    >
      {line.image ? (
        <Box
          w={{ base: "76px", md: "92px" }}
          h={{ base: "76px", md: "92px" }}
          flexShrink={0}
          overflow="hidden"
          rounded="md"
          bg="layoutBg"
        >
          <Image
            src={line.image.src}
            alt={line.image.alt || line.title}
            w="full"
            h="full"
            objectFit="contain"
          />
        </Box>
      ) : null}

      <Stack flex="1" minW={0} gap={3}>
        <Flex justify="space-between" gap={3} align="start">
          <Stack minW={0} gap={1}>
            <ChakraLink asChild fontWeight="semibold" lineClamp={2}>
              <NextLink href={`/products/${line.slug}`}>{line.title}</NextLink>
            </ChakraLink>
            <Text fontSize="sm" color="fgMuted">
              Each: {formatCartMoney(line.unitPrice)}
            </Text>
          </Stack>

          <Stack align="end" gap={2} flexShrink={0}>
            <Text fontWeight="semibold" whiteSpace="nowrap">
              {formatCartMoney(line.totalPrice)}
            </Text>
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => void removeLine(line.id)}
            >
              Remove
            </Button>
          </Stack>
        </Flex>

        <HStack gap={2} aria-label={`Quantity for ${line.title}`}>
          <Button
            size="sm"
            variant="outline"
            aria-label={`Decrease quantity of ${line.title}`}
            disabled={disabled}
            onClick={handleDecrement}
          >
            −
          </Button>
          <Text
            minW="8"
            textAlign="center"
            aria-live="polite"
            aria-label={`Quantity: ${quantity}`}
          >
            {quantity}
          </Text>
          <Button
            size="sm"
            variant="outline"
            aria-label={`Increase quantity of ${line.title}`}
            disabled={disabled || !canIncrement}
            onClick={() => void updateLine(line.id, quantity + 1)}
          >
            +
          </Button>
          <Text fontSize="sm" color="fgMuted">
            Line total: {formatCartMoney(line.totalPrice)}
          </Text>
        </HStack>
      </Stack>
    </Flex>
  );
}
