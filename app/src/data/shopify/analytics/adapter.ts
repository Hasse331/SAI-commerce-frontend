import type { ProductViewPayload } from "@shopify/hydrogen";
import type { ConsentCategories } from "@/lib/consent";

export type ShopifyPrivacyState = {
  consentStatus?: "pending" | "loaded";
  analyticsProcessingAllowed?: () => boolean;
};

export type NormalizedAnalyticsProduct = {
  slug: string;
  merchandiseId: string;
  title: string;
  price: string;
  vendor: string;
  quantity: number;
};

export function mapConsentToShopify(categories: ConsentCategories) {
  return {
    analytics: categories.analytics,
    preferences: categories.preferences,
    marketing: categories.marketing,
    sale_of_data: false,
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

export function mapProductView(product: NormalizedAnalyticsProduct): ProductViewPayload {
  return {
    products: [{
      id: product.slug,
      title: product.title,
      price: product.price,
      vendor: product.vendor,
      variantId: product.merchandiseId,
      variantTitle: product.title,
      quantity: product.quantity,
    }],
  };
}

export function createEventDeduper() {
  let previousKey: string | null = null;
  return {
    shouldPublish(key: string): boolean {
      if (key === previousKey) return false;
      previousKey = key;
      return true;
    },
  };
}
