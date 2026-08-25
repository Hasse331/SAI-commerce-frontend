import type { ProductViewPayload } from "@shopify/hydrogen";
import type { ConsentCategories } from "@/lib/consent";

export type ShopifyPrivacyState = {
  consentStatus?: "pending" | "loaded";
  analyticsProcessingAllowed?: () => boolean;
};

export type NormalizedAnalyticsProduct = {
  productId: string;
  variantId: string;
  title: string;
  price: string;
  vendor: string;
  variantTitle: string;
  quantity: number;
  sku: string | null;
};

export function mapConsentToShopify(categories: ConsentCategories) {
  return {
    analytics: categories.analytics,
    preferences: categories.preferences,
    marketing: categories.marketing,
    sale_of_data: false,
  } as const;
}

export function consentSignalAction(
  source: "hydrated" | "explicit" | "persistenceFailure",
  analyticsGranted: boolean,
) {
  return {
    analyticsGranted: source === "persistenceFailure" ? false : analyticsGranted,
    shouldSynchronize: source === "explicit",
  } as const;
}

export function isAnalyticsReady(
  localAnalyticsGranted: boolean,
  privacy: ShopifyPrivacyState | undefined,
): boolean {
  if (!localAnalyticsGranted || privacy?.consentStatus !== "loaded") return false;
  try {
    return privacy.analyticsProcessingAllowed?.() === true;
  } catch {
    return false;
  }
}

export function isAnalyticsPublisherReady(
  localAnalyticsGranted: boolean,
  privacy: ShopifyPrivacyState | undefined,
  analytics: { publish?: unknown } | undefined,
): boolean {
  return isAnalyticsReady(localAnalyticsGranted, privacy) && typeof analytics?.publish === "function";
}

export function createBoundedCompletion<T>(
  onComplete: (value: T) => void,
  schedule: (callback: () => void) => unknown,
  cancel: (handle: unknown) => void,
) {
  let completed = false;
  const handle = schedule(() => complete(false as T));
  function complete(value: T): boolean {
    if (completed) return false;
    completed = true;
    cancel(handle);
    onComplete(value);
    return true;
  }
  return { complete };
}

export function mapProductView(product: NormalizedAnalyticsProduct): ProductViewPayload {
  return {
    products: [{
      id: product.productId,
      title: product.title,
      price: product.price,
      vendor: product.vendor,
      variantId: product.variantId,
      variantTitle: product.variantTitle,
      quantity: product.quantity,
      sku: product.sku,
    }],
  };
}

export function createEventDeduper() {
  const previousKeys = new Map<string, string>();
  return {
    shouldPublish(eventType: string, key: string): boolean {
      if (previousKeys.get(eventType) === key) return false;
      previousKeys.set(eventType, key);
      return true;
    },
  };
}

export function createPrivacySynchronizer<T>(keyOf: (value: T) => unknown = (value) => value) {
  let pending: T | undefined;
  let synchronized: T | undefined;
  let inFlight = false;
  return {
    enqueue(value: T) {
      if (synchronized === undefined || keyOf(value) !== keyOf(synchronized)) pending = value;
    },
    flush(
      readiness: boolean,
      synchronize: (value: T, complete: (succeeded: boolean) => void) => void,
    ): boolean {
      if (!readiness || pending === undefined || inFlight) return false;
      const value = pending;
      inFlight = true;
      synchronize(value, (succeeded) => {
        inFlight = false;
        if (succeeded && pending === value) {
          synchronized = value;
          pending = undefined;
        }
      });
      return true;
    },
  };
}
