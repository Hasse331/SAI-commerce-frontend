import type { ConsentDecision } from "@/lib/consent";
import type { NormalizedAnalyticsProduct } from "./adapter";

export const CONSENT_CHANGED_EVENT = "sai:consent-changed";
export const PRODUCT_VIEWED_EVENT = "sai:product-viewed";
export const CART_CHANGED_EVENT = "sai:cart-changed";
let latestProductView: NormalizedAnalyticsProduct | null = null;

export function announceConsentDecision(decision: ConsentDecision): void {
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: decision }));
}

export function announceProductView(product: NormalizedAnalyticsProduct): void {
  latestProductView = product;
  window.dispatchEvent(new CustomEvent(PRODUCT_VIEWED_EVENT, { detail: product }));
}

export function getLatestProductView(): NormalizedAnalyticsProduct | null {
  return latestProductView;
}

export function announceCartChange(detail: { kind: "add" | "update"; cart: unknown; previousCart: unknown }): void {
  window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT, { detail }));
}
