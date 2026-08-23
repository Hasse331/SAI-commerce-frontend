import {
  CONSENT_DURATION_MS,
  CONSENT_VERSION,
  type ConsentCategories,
  type ConsentDecision,
} from "./domain";

export const CONSENT_COOKIE_NAME = "sai_consent";
export const CONSENT_COOKIE_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

function isCategories(value: unknown): value is ConsentCategories {
  if (typeof value !== "object" || value === null) return false;
  const categories = value as Record<string, unknown>;
  return (
    categories.necessary === true &&
    typeof categories.analytics === "boolean" &&
    typeof categories.preferences === "boolean" &&
    typeof categories.marketing === "boolean"
  );
}

export function isCurrentConsentDecision(value: unknown, now = new Date()): value is ConsentDecision {
  if (typeof value !== "object" || value === null) return false;
  const decision = value as Record<string, unknown>;
  if (
    decision.version !== CONSENT_VERSION ||
    typeof decision.decidedAt !== "string" ||
    typeof decision.expiresAt !== "string" ||
    !isCategories(decision.categories)
  ) return false;

  const decidedAt = Date.parse(decision.decidedAt);
  const expiresAt = Date.parse(decision.expiresAt);
  return (
    Number.isFinite(decidedAt) &&
    Number.isFinite(expiresAt) &&
    decidedAt <= now.getTime() &&
    expiresAt - decidedAt === CONSENT_DURATION_MS &&
    now.getTime() < expiresAt
  );
}

export function parseConsentCookie(cookieHeader: string | undefined, now = new Date()): ConsentDecision | null {
  if (!cookieHeader) return null;
  const encoded = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CONSENT_COOKIE_NAME}=`))
    ?.slice(CONSENT_COOKIE_NAME.length + 1);
  if (!encoded) return null;

  try {
    const value: unknown = JSON.parse(decodeURIComponent(encoded));
    return isCurrentConsentDecision(value, now) ? value : null;
  } catch {
    return null;
  }
}

export function serializeConsentCookie(decision: ConsentDecision): string {
  return [
    `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(decision))}`,
    `Max-Age=${CONSENT_COOKIE_MAX_AGE_SECONDS}`,
    "Path=/",
    "SameSite=Lax",
  ].join("; ");
}
