import assert from "node:assert/strict";
import test from "node:test";
import * as productDetailPageLoader from "../loaders/product-detail-page.ts";
import * as productsPageLoader from "../loaders/products-page.ts";
import type { ShopifyProductNode } from "@/types/shopify";
import { mapStorefrontProductToListItem } from "./product-primitives.ts";

function makeShopifyProduct(
  overrides: Partial<ShopifyProductNode> = {},
): ShopifyProductNode {
  return {
    __typename: "Product",
    id: "gid://shopify/Product/1",
    handle: "test-product",
    title: "Test product",
    description: "",
    availableForSale: true,
    productType: "Test type",
    featuredImage: null,
    priceRange: {
      minVariantPrice: {
        amount: "0",
        currencyCode: "USD",
      },
    },
    cardSpecsMetafield: null,
    subtitleMetafield: null,
    variants: {
      nodes: [],
    },
    ...overrides,
  };
}

test("maps the first available variant as purchasable merchandise", () => {
  const product = makeShopifyProduct({
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/101",
          availableForSale: true,
        },
      ],
    },
  });

  assert.equal(
    mapStorefrontProductToListItem(product).merchandiseId,
    "gid://shopify/ProductVariant/101",
  );
});

test("omits merchandise when the default variant is unavailable", () => {
  const product = makeShopifyProduct({
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/101",
          availableForSale: false,
        },
      ],
    },
  });

  assert.equal(mapStorefrontProductToListItem(product).merchandiseId, undefined);
});

test("product detail query requests the default purchasable variant fields", () => {
  assert.match(
    (productDetailPageLoader as { productDetailPagesQuery?: string })
      .productDetailPagesQuery ?? "",
    /variants\(first: 1\)\s*{\s*nodes\s*{\s*id\s*availableForSale\s*}\s*}/s,
  );
});

test("products page query requests the default purchasable variant fields", () => {
  assert.match(
    (productsPageLoader as { productsPageQuery?: string }).productsPageQuery ?? "",
    /variants\(first: 1\)\s*{\s*nodes\s*{\s*id\s*availableForSale\s*}\s*}/s,
  );
});
