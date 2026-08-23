"use client";

import { useEffect } from "react";
import type { ProductSummary } from "@/types/products";
import { announceProductView } from "./events";

export function ShopifyProductView({ product }: { product: ProductSummary }) {
  useEffect(() => {
    if (!product.merchandiseId) return;
    announceProductView({
      slug: product.slug,
      merchandiseId: product.merchandiseId,
      title: product.title,
      price: product.price.replaceAll(",", ""),
      vendor: "Spectrum Audio Instruments",
      quantity: 1,
    });
  }, [product]);
  return null;
}
