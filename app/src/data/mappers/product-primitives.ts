import type { ProductSpecItem, ProductSummary } from "@/types/products";
import type {
  ShopifyProductNode,
  ShopifyScalarMetaobjectField,
} from "@/types/shopify";
import { productComponentFieldKeys } from "@/data/shopify/metaobjects/components";
import { getMetaobjectTextValue, parseStringList } from "./shopify";

export function mapProductBasicToListItem(
  product: ProductSummary,
): ProductSummary {
  return {
    ...product,
  };
}

export function mapStorefrontProductToListItem(
  product: ShopifyProductNode,
  hasDetails = false,
  overrideSpecs?: ProductSpecItem[],
): ProductSummary {
  const defaultVariant = product.variants.nodes[0];

  return {
    slug: product.handle,
    merchandiseId: defaultVariant?.availableForSale
      ? defaultVariant.id
      : undefined,
    hasDetails,
    availableForSale: product.availableForSale,
    categoryLabel: product.productType || "",
    title: product.title,
    subtitle: product.subtitleMetafield?.value || "",
    description: product.description || "",
    image: {
      src: product.featuredImage?.url || "/globe.svg",
      alt: product.featuredImage?.altText || product.title,
    },
    price: formatMoney(product.priceRange.minVariantPrice.amount),
    priceSubtitle: product.priceRange.minVariantPrice.currencyCode,
    specs:
      overrideSpecs && overrideSpecs.length > 0
        ? overrideSpecs
        : mapProductCardSpecs(product.cardSpecsMetafield?.reference?.fields),
    analytics: defaultVariant
      ? {
          productId: product.id,
          variantId: defaultVariant.id,
          vendor: product.vendor,
          variantTitle: defaultVariant.title,
          price: defaultVariant.price.amount,
          sku: defaultVariant.sku,
        }
      : undefined,
  };
}

export function mapProductCardSpecs(
  fields: ShopifyScalarMetaobjectField[] | undefined,
  limit?: number,
): ProductSpecItem[] {
  return mapSpecsFromMetaobjectFields(
    fields,
    productComponentFieldKeys.cardSpecDescription,
    productComponentFieldKeys.cardSpecDetail,
    limit,
  );
}

export function mapSpecsFromMetaobjectFields(
  fields: ShopifyScalarMetaobjectField[] | undefined,
  labelKey: string,
  valueKey: string,
  limit?: number,
): ProductSpecItem[] {
  if (!fields?.length) {
    return [];
  }

  const labels = parseStringList(getMetaobjectTextValue(fields, labelKey));
  const values = parseStringList(getMetaobjectTextValue(fields, valueKey));

  const specs = labels
    .map((label, index) => ({
      label,
      value: values[index] || "",
    }))
    .filter((spec) => spec.label && spec.value);

  return typeof limit === "number" ? specs.slice(0, limit) : specs;
}

function formatMoney(amount: string): string {
  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount)) {
    return amount;
  }

  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(numericAmount);
}
