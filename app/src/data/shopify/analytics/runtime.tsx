"use client";

import { AnalyticsEvent, type PageViewPayload, type ProductViewPayload } from "@shopify/hydrogen";
import { ShopifyScripts } from "@shopify/hydrogen/react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import type { ConsentDecision } from "@/lib/consent";
import { consentSignalAction, createBoundedCompletion, createEventDeduper, createPrivacySynchronizer, isAnalyticsPublisherReady, mapConsentToShopify, mapProductView, type NormalizedAnalyticsProduct } from "./adapter";
import { CONSENT_CHANGED_EVENT, CONSENT_HYDRATED_EVENT, CONSENT_PERSISTENCE_FAILURE_EVENT, getLatestHydratedConsent, getLatestProductView, PRODUCT_VIEWED_EVENT } from "./events";
import type { ShopifyAnalyticsConfig } from "./config";

type PrivacyApi = NonNullable<Window["Shopify"]>["customerPrivacy"];
const MAX_PRIVACY_READINESS_ATTEMPTS = 20;
const PRIVACY_READINESS_INTERVAL_MS = 250;
const PRIVACY_CALLBACK_TIMEOUT_MS = 200;

function publishPage(payload: PageViewPayload): void {
  window.Shopify?.analytics?.publish(AnalyticsEvent.PAGE_VIEWED, payload);
}

function publishProduct(payload: ProductViewPayload): void {
  window.Shopify?.analytics?.publish(AnalyticsEvent.PRODUCT_VIEWED, payload);
}

export function ShopifyAnalyticsRuntime({ config }: { config: ShopifyAnalyticsConfig }) {
  const pathname = usePathname();
  const localAnalyticsGranted = useRef(false);
  const deduper = useRef(createEventDeduper());
  const currentProduct = useRef<NormalizedAnalyticsProduct | null>(null);
  const didInitializeHydration = useRef(false);
  const synchronizer = useRef(createPrivacySynchronizer<ConsentDecision>((decision) =>
    JSON.stringify(decision.categories),
  ));

  const publishCurrentPage = useCallback(() => {
    if (!isAnalyticsPublisherReady(localAnalyticsGranted.current, window.Shopify?.customerPrivacy, window.Shopify?.analytics)) return;
    if (deduper.current.shouldPublish("page", pathname)) {
      publishPage({ url: window.location.href });
    }
  }, [pathname]);

  const publishCurrentProduct = useCallback(() => {
    const product = currentProduct.current;
    if (!product || !isAnalyticsPublisherReady(localAnalyticsGranted.current, window.Shopify?.customerPrivacy, window.Shopify?.analytics)) return;
    if (deduper.current.shouldPublish("product", `${product.variantId}:${pathname}`)) {
      publishProduct(mapProductView(product));
    }
  }, [pathname]);

  useEffect(() => {
    currentProduct.current = getLatestProductView();
    if (!didInitializeHydration.current) {
      didInitializeHydration.current = true;
      const hydratedDecision = getLatestHydratedConsent();
      if (hydratedDecision) {
        localAnalyticsGranted.current = hydratedDecision.categories.analytics;
        publishCurrentPage();
        publishCurrentProduct();
      }
    }
    let readinessTimer: ReturnType<typeof setInterval> | undefined;
    const callbackTimers = new Map<ReturnType<typeof setTimeout>, () => void>();
    let attempts = 0;

    const clearReadinessTimer = () => {
      if (readinessTimer !== undefined) clearInterval(readinessTimer);
      readinessTimer = undefined;
    };
    const trySynchronize = () => {
      attempts += 1;
      const privacy: PrivacyApi | undefined = window.Shopify?.customerPrivacy;
      const ready = privacy?.consentStatus === "loaded" && typeof privacy.setTrackingConsent === "function";
      synchronizer.current.flush(ready, (decision, complete) => {
        const completion = createBoundedCompletion(
          complete,
          (onTimeout) => {
            const timer = setTimeout(() => {
              callbackTimers.delete(timer);
              onTimeout();
            }, PRIVACY_CALLBACK_TIMEOUT_MS);
            callbackTimers.set(timer, onTimeout);
            return timer;
          },
          (timer) => {
            clearTimeout(timer as ReturnType<typeof setTimeout>);
            callbackTimers.delete(timer as ReturnType<typeof setTimeout>);
          },
        );
        try {
          privacy!.setTrackingConsent(mapConsentToShopify(decision.categories), (result) => {
            const succeeded = !result?.error;
            if (completion.complete(succeeded) && succeeded) {
              clearReadinessTimer();
              document.dispatchEvent(new CustomEvent("visitorConsentCollected", { detail: { source: "interaction" } }));
              publishCurrentPage();
              publishCurrentProduct();
            }
          });
        } catch {
          completion.complete(false);
        }
      });
      if (attempts >= MAX_PRIVACY_READINESS_ATTEMPTS) clearReadinessTimer();
    };
    const onConsent = (event: Event) => {
      const decision = (event as CustomEvent<ConsentDecision>).detail;
      const action = consentSignalAction("explicit", decision.categories.analytics);
      localAnalyticsGranted.current = action.analyticsGranted;
      synchronizer.current.enqueue(decision);
      attempts = 0;
      clearReadinessTimer();
      readinessTimer = setInterval(trySynchronize, PRIVACY_READINESS_INTERVAL_MS);
      trySynchronize();
    };
    const onHydratedConsent = (event: Event) => {
      const decision = (event as CustomEvent<ConsentDecision>).detail;
      const action = consentSignalAction("hydrated", decision.categories.analytics);
      localAnalyticsGranted.current = action.analyticsGranted;
      publishCurrentPage();
      publishCurrentProduct();
    };
    const onConsentPersistenceFailure = () => {
      const action = consentSignalAction("persistenceFailure", false);
      localAnalyticsGranted.current = action.analyticsGranted;
      synchronizer.current = createPrivacySynchronizer<ConsentDecision>((decision) =>
        JSON.stringify(decision.categories),
      );
      clearReadinessTimer();
    };
    const onProduct = (event: Event) => {
      currentProduct.current = (event as CustomEvent<NormalizedAnalyticsProduct | null>).detail;
      publishCurrentProduct();
    };
    const onPrivacyReadySignal = () => {
      trySynchronize();
      publishCurrentPage();
      publishCurrentProduct();
    };
    window.addEventListener(CONSENT_CHANGED_EVENT, onConsent);
    window.addEventListener(CONSENT_HYDRATED_EVENT, onHydratedConsent);
    window.addEventListener(CONSENT_PERSISTENCE_FAILURE_EVENT, onConsentPersistenceFailure);
    window.addEventListener(PRODUCT_VIEWED_EVENT, onProduct);
    const consentScript = document.getElementById("shopify-consent");
    consentScript?.addEventListener("load", onPrivacyReadySignal);
    document.addEventListener("visitorConsentCollected", onPrivacyReadySignal);
    return () => {
      clearReadinessTimer();
      callbackTimers.forEach((onTimeout, timer) => {
        clearTimeout(timer);
        onTimeout();
      });
      callbackTimers.clear();
      window.removeEventListener(CONSENT_CHANGED_EVENT, onConsent);
      window.removeEventListener(CONSENT_HYDRATED_EVENT, onHydratedConsent);
      window.removeEventListener(CONSENT_PERSISTENCE_FAILURE_EVENT, onConsentPersistenceFailure);
      window.removeEventListener(PRODUCT_VIEWED_EVENT, onProduct);
      consentScript?.removeEventListener("load", onPrivacyReadySignal);
      document.removeEventListener("visitorConsentCollected", onPrivacyReadySignal);
    };
  }, [publishCurrentPage, publishCurrentProduct]);

  useEffect(() => {
    publishCurrentPage();
  }, [publishCurrentPage]);

  return <ShopifyScripts shop={config} analytics={{ channel: "hydrogen" }} consent={{ mode: "custom-banner" }} webMcp={false} />;
}
