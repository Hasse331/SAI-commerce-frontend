"use client";

import { Box } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import {
  CONTACT_EYEBROW_INDICATOR_COLOR,
  CONTACT_EYEBROW_INDICATOR_PULSE_DURATION_SECONDS,
  CONTACT_EYEBROW_INDICATOR_SIZE,
} from "./contact-eyebrow-indicator-config";

const contactEyebrowIndicatorPulse = keyframes`
  0%, 100% {
    opacity: 0.35;
    transform: scale(0.82);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
`;

export const CONTACT_EYEBROW_INDICATOR_PULSE_ANIMATION = `${contactEyebrowIndicatorPulse} ${CONTACT_EYEBROW_INDICATOR_PULSE_DURATION_SECONDS}s ease-in-out infinite`;

export function ContactEyebrowIndicator() {
  return (
    <Box
      aria-hidden="true"
      boxSize={CONTACT_EYEBROW_INDICATOR_SIZE}
      borderRadius="full"
      bg={CONTACT_EYEBROW_INDICATOR_COLOR}
      animation={CONTACT_EYEBROW_INDICATOR_PULSE_ANIMATION}
      flexShrink={0}
    />
  );
}
