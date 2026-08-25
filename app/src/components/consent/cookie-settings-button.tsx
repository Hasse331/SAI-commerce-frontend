"use client";

import { Button } from "@chakra-ui/react";

import { useConsent } from "./consent-provider";
import { CONSENT_UI_TEXT } from "./consent-presentation";

export function CookieSettingsButton() {
  const { openSettings } = useConsent();
  return (
    <Button variant="plain" size="sm" textDecoration="underline" onClick={openSettings}>
      {CONSENT_UI_TEXT.reopen}
    </Button>
  );
}
