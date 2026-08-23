"use client";

import { AnalyticsEvent } from "@shopify/hydrogen";
import { ShopifyScripts } from "@shopify/hydrogen/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { ConsentDecision } from "@/lib/consent";
import { createEventDeduper, isAnalyticsReady, mapConsentToShopify, mapProductView, type NormalizedAnalyticsProduct } from "./adapter";
import { CART_CHANGED_EVENT, CONSENT_CHANGED_EVENT, getLatestProductView, PRODUCT_VIEWED_EVENT } from "./events";
import type { ShopifyAnalyticsConfig } from "./config";

type PrivacyApi = NonNullable<Window["Shopify"]>["customerPrivacy"];

function publishIfAllowed(
  event: Parameters<NonNullable<NonNullable<Window["Shopify"]>["analytics"]>["publish"]>[0],
  payload: object,
) {
  const shopify = window.Shopify;
  if (!isAnalyticsReady(true, shopify?.customerPrivacy)) return;
  shopify?.analytics?.publish(event, payload as never);
}

function synchronizeConsent(
  decision: ConsentDecision,
  privacy: PrivacyApi | undefined,
  onSynchronized: () => void,
): void {
  if (!privacy || typeof privacy.setTrackingConsent !== "function") return;
  try {
    privacy.setTrackingConsent(mapConsentToShopify(decision.categories), (result) => {
      if (!result?.error) {
        document.dispatchEvent(new CustomEvent("visitorConsentCollected", { detail: { source: "interaction" } }));
        onSynchronized();
      }
    });
  } catch {
    // Shopify remains fail-closed when its privacy runtime is unavailable.
  }
}

export function ShopifyAnalyticsRuntime({ config }: { config: ShopifyAnalyticsConfig }) {
  const pathname = usePathname();
  const localAnalyticsGranted = useRef(false);
  const deduper = useRef(createEventDeduper());
  const currentProduct = useRef<NormalizedAnalyticsProduct | null>(null);

  useEffect(() => {
    currentProduct.current = getLatestProductView();
    const onConsent = (event: Event) => {
      const decision = (event as CustomEvent<ConsentDecision>).detail;
      localAnalyticsGranted.current = decision.categories.analytics;
      synchronizeConsent(decision, window.Shopify?.customerPrivacy, () => {
        if (!decision.categories.analytics) return;
        publishIfAllowed(AnalyticsEvent.PAGE_VIEWED, { url: window.location.href });
        if (currentProduct.current) {
          publishIfAllowed(AnalyticsEvent.PRODUCT_VIEWED, mapProductView(currentProduct.current));
        }
      });
    };
    const onProduct = (event: Event) => {
      if (!localAnalyticsGranted.current) return;
      const product = (event as CustomEvent<NormalizedAnalyticsProduct>).detail;
      currentProduct.current = product;
      const key = `product:${product.merchandiseId}:${pathname}`;
      if (deduper.current.shouldPublish(key)) publishIfAllowed(AnalyticsEvent.PRODUCT_VIEWED, mapProductView(product));
    };
    const onCart = (event: Event) => {
      if (!localAnalyticsGranted.current) return;
      const detail = (event as CustomEvent<{ kind: "add" | "update"; cart: unknown; previousCart: unknown }>).detail;
      publishIfAllowed(AnalyticsEvent.CART_UPDATED, { cart: detail.cart, prevCart: detail.previousCart });
      if (detail.kind === "add") publishIfAllowed(AnalyticsEvent.PRODUCT_ADD_TO_CART, { cart: detail.cart, prevCart: detail.previousCart });
    };
    window.addEventListener(CONSENT_CHANGED_EVENT, onConsent);
    window.addEventListener(PRODUCT_VIEWED_EVENT, onProduct);
    window.addEventListener(CART_CHANGED_EVENT, onCart);
    return () => {
      window.removeEventListener(CONSENT_CHANGED_EVENT, onConsent);
      window.removeEventListener(PRODUCT_VIEWED_EVENT, onProduct);
      window.removeEventListener(CART_CHANGED_EVENT, onCart);
    };
  }, [pathname]);

  useEffect(() => {
    if (!localAnalyticsGranted.current) return;
    const key = `page:${pathname}`;
    if (deduper.current.shouldPublish(key)) publishIfAllowed(AnalyticsEvent.PAGE_VIEWED, { url: window.location.href });
  }, [pathname]);

  return <ShopifyScripts shop={config} analytics={{ channel: "hydrogen" }} consent={{ mode: "custom-banner" }} webMcp={false} />;
}
