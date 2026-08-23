import type { ConsentDecision } from "./domain";
import { parseConsentCookie, serializeConsentCookie } from "./persistence";

export function readConsentCookie(now = new Date()): ConsentDecision | null {
  if (typeof document === "undefined") return null;
  return parseConsentCookie(document.cookie, now);
}

export function writeConsentCookie(decision: ConsentDecision): void {
  if (typeof document !== "undefined") document.cookie = serializeConsentCookie(decision);
}
