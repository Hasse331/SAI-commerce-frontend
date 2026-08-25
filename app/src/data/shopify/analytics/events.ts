import type { ConsentDecision } from "@/lib/consent";
import type { NormalizedAnalyticsProduct } from "./adapter";

export const CONSENT_CHANGED_EVENT = "sai:consent-changed";
export const CONSENT_HYDRATED_EVENT = "sai:consent-hydrated";
export const CONSENT_PERSISTENCE_FAILURE_EVENT = "sai:consent-persistence-failure";
export const PRODUCT_VIEWED_EVENT = "sai:product-viewed";
let latestProductView: NormalizedAnalyticsProduct | null = null;
let latestHydratedConsent: ConsentDecision | null = null;

export function announceConsentDecision(decision: ConsentDecision): void {
  latestHydratedConsent = decision;
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: decision }));
}

export function announceHydratedConsent(decision: ConsentDecision): void {
  latestHydratedConsent = decision;
  window.dispatchEvent(new CustomEvent(CONSENT_HYDRATED_EVENT, { detail: decision }));
}

export function getLatestHydratedConsent(): ConsentDecision | null {
  return latestHydratedConsent;
}

export function announceConsentPersistenceFailure(): void {
  latestHydratedConsent = null;
  window.dispatchEvent(new Event(CONSENT_PERSISTENCE_FAILURE_EVENT));
}

export function announceProductView(product: NormalizedAnalyticsProduct): void {
  latestProductView = product;
  window.dispatchEvent(new CustomEvent(PRODUCT_VIEWED_EVENT, { detail: product }));
}

export function clearProductView(): void {
  latestProductView = null;
  window.dispatchEvent(new CustomEvent(PRODUCT_VIEWED_EVENT, { detail: null }));
}

export function getLatestProductView(): NormalizedAnalyticsProduct | null {
  return latestProductView;
}
