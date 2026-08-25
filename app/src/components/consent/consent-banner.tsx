"use client";

import { Box, Button, Flex, Heading, Portal, Stack, Text } from "@chakra-ui/react";

import { useConsent } from "./consent-provider";
import { CONSENT_UI_TEXT } from "./consent-presentation";

export function ConsentBanner() {
  const { acceptAll, openSettings, rejectOptional, showBanner, storageError } = useConsent();
  if (!showBanner) return null;

  return (
    <Portal>
      <Box
        as="section"
        aria-labelledby="cookie-banner-title"
        position="fixed"
        insetX={{ base: 3, md: 8 }}
        bottom={{ base: 3, md: 8 }}
        zIndex={1500}
        maxW="960px"
        mx="auto"
        p={{ base: 5, md: 6 }}
        bg="bg"
        borderWidth="1px"
        borderColor="border"
        borderRadius="lg"
        boxShadow="0 18px 60px rgba(0, 0, 0, 0.55)"
      >
        <Stack gap={4}>
          <Box>
            <Heading id="cookie-banner-title" as="h2" size="md">
              Your privacy choices
            </Heading>
            <Text mt={2} color="fgMuted">
              We use necessary storage for the storefront. With your permission, Shopify
              Analytics helps us understand visits and improve the store.
            </Text>
          </Box>
          {storageError ? <Text role="alert" color="accentBright">{storageError}</Text> : null}
          <Flex direction={{ base: "column", md: "row" }} gap={3} justify="flex-end">
            <Button variant="outline" onClick={openSettings}>{CONSENT_UI_TEXT.customize}</Button>
            <Button variant="outline" onClick={rejectOptional}>{CONSENT_UI_TEXT.rejectOptional}</Button>
            <Button colorPalette="orange" onClick={acceptAll}>{CONSENT_UI_TEXT.acceptAll}</Button>
          </Flex>
        </Stack>
      </Box>
    </Portal>
  );
}
