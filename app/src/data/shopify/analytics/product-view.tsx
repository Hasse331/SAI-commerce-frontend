"use client";

import { useEffect } from "react";
import type { ProductSummary } from "@/types/products";
import { announceProductView, clearProductView } from "./events";

export function ShopifyProductView({ product }: { product: ProductSummary }) {
  useEffect(() => {
    if (!product.analytics) return;
    announceProductView({
      productId: product.analytics.productId,
      variantId: product.analytics.variantId,
      title: product.title,
      price: product.analytics.price,
      vendor: product.analytics.vendor,
      variantTitle: product.analytics.variantTitle,
      quantity: 1,
      sku: product.analytics.sku,
    });
    return clearProductView;
  }, [product]);
  return null;
}
