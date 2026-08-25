"use client";

import { useState } from "react";
import { Button, CloseButton, Dialog, Flex, Portal, Stack, Switch, Text } from "@chakra-ui/react";

import {
  createCustomizationDraft,
  CONSENT_UI_TEXT,
  updateCustomizationDraft,
  type CustomizationDraft,
  type OptionalConsentCategory,
} from "./consent-presentation";
import { useConsent } from "./consent-provider";

const optionalCategories: ReadonlyArray<{
  key: OptionalConsentCategory;
  label: string;
  description: string;
}> = [
  {
    key: "analytics",
    label: "Analytics",
    description: "Helps us understand storefront visits through Shopify Analytics.",
  },
  {
    key: "preferences",
    label: "Preferences",
    description: "Allows optional settings that remember how you use the storefront.",
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "Allows optional marketing features. No marketing pixels are currently installed.",
  },
];

export function ConsentSettingsDialog() {
  const { isSettingsOpen } = useConsent();
  return isSettingsOpen ? <OpenConsentSettingsDialog /> : null;
}

function OpenConsentSettingsDialog() {
  const {
    categories,
    closeSettings,
    rejectOptional,
    saveCustomization,
    storageError,
  } = useConsent();
  const [draft, setDraft] = useState<CustomizationDraft>(() => createCustomizationDraft(categories));

  return (
    <Dialog.Root
      open
      onOpenChange={({ open }) => { if (!open) closeSettings(); }}
      modal
      trapFocus
      restoreFocus
      closeOnEscape
      closeOnInteractOutside
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.700" zIndex={1600} />
        <Dialog.Positioner zIndex={1601} p={{ base: 3, md: 6 }}>
          <Dialog.Content maxW="640px" bg="bg" borderWidth="1px" borderColor="border">
            <Dialog.Header alignItems="start">
              <Stack gap={1} pe={10}>
                <Dialog.Title>Cookie settings</Dialog.Title>
                <Dialog.Description color="fgMuted">
                  Choose which optional processing you allow. You can change these choices at any time.
                </Dialog.Description>
              </Stack>
            </Dialog.Header>
            <Dialog.CloseTrigger asChild>
              <CloseButton aria-label="Close cookie settings" position="absolute" top={4} right={4} />
            </Dialog.CloseTrigger>
            <Dialog.Body>
              <Stack gap={5}>
                <Switch.Root checked disabled justifyContent="space-between">
                  <Switch.HiddenInput />
                  <Switch.Label>
                    <Text fontWeight="semibold">Necessary</Text>
                    <Text fontSize="sm" color="fgMuted">
                      Required for core storefront features such as cart and consent storage. Always enabled.
                    </Text>
                  </Switch.Label>
                  <Switch.Control><Switch.Thumb /></Switch.Control>
                </Switch.Root>
                {optionalCategories.map(({ key, label, description }) => (
                  <Switch.Root
                    key={key}
                    checked={draft[key]}
                    onCheckedChange={({ checked }) => {
                      setDraft((current) => updateCustomizationDraft(current, key, checked));
                    }}
                    justifyContent="space-between"
                  >
                    <Switch.HiddenInput />
                    <Switch.Label>
                      <Text fontWeight="semibold">{label}</Text>
                      <Text fontSize="sm" color="fgMuted">{description}</Text>
                    </Switch.Label>
                    <Switch.Control><Switch.Thumb /></Switch.Control>
                  </Switch.Root>
                ))}
                {storageError ? <Text role="alert" color="accentBright">{storageError}</Text> : null}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Flex direction={{ base: "column-reverse", md: "row" }} gap={3} w="full" justify="flex-end">
                <Button variant="outline" onClick={rejectOptional}>{CONSENT_UI_TEXT.rejectOptional}</Button>
                <Button colorPalette="orange" onClick={() => saveCustomization(draft)}>
                  {CONSENT_UI_TEXT.saveChoices}
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
