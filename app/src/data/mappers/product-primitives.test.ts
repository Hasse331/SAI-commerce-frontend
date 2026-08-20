import assert from "node:assert/strict";
import test from "node:test";
import * as productDetailPageLoader from "../loaders/product-detail-page.ts";
import * as productsPageLoader from "../loaders/products-page.ts";
import type { ShopifyProductNode } from "@/types/shopify";
import { mapStorefrontProductToListItem } from "./product-primitives.ts";

const defaultVariantSelection = `
              variants(first: 1) {
                nodes {
                  id
                  availableForSale
                }
              }`;

const defaultVariantSelectionPattern =
  /variants\(first: 1\)\s*{\s*nodes\s*{\s*id\s*availableForSale\s*}\s*}/s;

function getSelectionSet(query: string, marker: string): string {
  const markerIndex = query.indexOf(marker);
  const openingBraceIndex = query.indexOf("{", markerIndex + marker.length);

  if (markerIndex === -1 || openingBraceIndex === -1) {
    throw new Error(`Query has no ${marker} selection`);
  }

  let depth = 0;

  for (let index = openingBraceIndex; index < query.length; index += 1) {
    if (query[index] === "{") {
      depth += 1;
    }

    if (query[index] === "}") {
      depth -= 1;

      if (depth === 0) {
        return query.slice(openingBraceIndex + 1, index);
      }
    }
  }

  throw new Error(`Query has an unclosed ${marker} selection`);
}

function getProductsPageListProductBranch(query: string): string {
  const operationSelection = getSelectionSet(query, "query ProductsPageMetaobject");
  const metaobjectSelection = getSelectionSet(
    operationSelection,
    "metaobject(handle: { type: $type, handle: $handle })",
  );
  const fieldsSelection = getSelectionSet(metaobjectSelection, "fields");
  const referencesSelection = getSelectionSet(
    fieldsSelection,
    "references(first: 50)",
  );
  const nodesSelection = getSelectionSet(referencesSelection, "nodes");

  return getSelectionSet(nodesSelection, "... on Product");
}

function getProductDetailPageProductBranch(query: string): string {
  const operationSelection = getSelectionSet(query, "query ProductDetailPages");
  const detailPagesSelection = getSelectionSet(
    operationSelection,
    "detailPages: metaobjects",
  );
  const nodesSelection = getSelectionSet(detailPagesSelection, "nodes");
  const fieldsSelection = getSelectionSet(nodesSelection, "fields");
  const referenceSelection = getSelectionSet(fieldsSelection, "reference");

  return getSelectionSet(referenceSelection, "... on Product");
}

function moveVariantSelectionToDetailPageProductBranch(query: string): string {
  const detailPageProductBranch = "            ... on Product {";
  const queryWithoutListVariants = query.replace(defaultVariantSelection, "");
  const detailPageProductBranchIndex = queryWithoutListVariants.lastIndexOf(
    detailPageProductBranch,
  );

  if (detailPageProductBranchIndex === -1) {
    throw new Error("Products page query has no detail page product branch");
  }

  return [
    queryWithoutListVariants.slice(0, detailPageProductBranchIndex),
    detailPageProductBranch,
    defaultVariantSelection,
    queryWithoutListVariants.slice(
      detailPageProductBranchIndex + detailPageProductBranch.length,
    ),
  ].join("");
}

function moveVariantSelectionToDecoyReferences(query: string): string {
  const metaobjectBranch =
    "    metaobject(handle: { type: $type, handle: $handle }) {";
  const decoyReferences = `    decoy {
      references(first: 50) {
        nodes {
          ... on Product {${defaultVariantSelection}
          }
        }
      }
    }
`;

  return query
    .replace(defaultVariantSelection, "")
    .replace(metaobjectBranch, `${decoyReferences}${metaobjectBranch}`);
}

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

test("does not select a later variant when the default variant is unavailable", () => {
  const product = makeShopifyProduct({
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/101",
          availableForSale: false,
        },
        {
          id: "gid://shopify/ProductVariant/102",
          availableForSale: true,
        },
      ],
    },
  });

  assert.equal(mapStorefrontProductToListItem(product).merchandiseId, undefined);
});

test("product detail query requests the default purchasable variant fields", () => {
  assert.match(
    getProductDetailPageProductBranch(
      (productDetailPageLoader as { productDetailPagesQuery?: string })
        .productDetailPagesQuery ?? "",
    ),
    defaultVariantSelectionPattern,
  );
});

test("products page query requests the default purchasable variant fields", () => {
  assert.match(
    getProductsPageListProductBranch(
      (productsPageLoader as { productsPageQuery?: string }).productsPageQuery ?? "",
    ),
    defaultVariantSelectionPattern,
  );
});

test("products page list contract rejects detail-page-only variants", () => {
  const incorrectlyScopedQuery = moveVariantSelectionToDetailPageProductBranch(
    (productsPageLoader as { productsPageQuery?: string }).productsPageQuery ?? "",
  );

  assert.doesNotMatch(
    getProductsPageListProductBranch(incorrectlyScopedQuery),
    defaultVariantSelectionPattern,
  );
});

test("products page list contract rejects decoy references", () => {
  const incorrectlyScopedQuery = moveVariantSelectionToDecoyReferences(
    (productsPageLoader as { productsPageQuery?: string }).productsPageQuery ?? "",
  );

  assert.doesNotMatch(
    getProductsPageListProductBranch(incorrectlyScopedQuery),
    defaultVariantSelectionPattern,
  );
});
