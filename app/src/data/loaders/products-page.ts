import { productsPageIntroMockData } from "@/data/mock/products/products-page-intro";
import { productBasicMockData } from "@/data/mock/products/product-basic";
import {
  getDetailPageProductHandles,
  getDetailPageSpecs,
  getMetaobjectFields,
  mapPageSeo,
  mapProductBasicToListItem,
  mapProductsPageItems,
  mapTextContentBlockReference,
} from "@/data/mappers";
import { storefrontQuery } from "@/data/shopify/storefront-client";
import type { ShopifyProductsPageQueryData } from "@/types/shopify";
import { isShopifyDataSource } from "@/data/source";
import type { ProductsPageData } from "@/types/products";
import {
  productsPageFieldKeys,
  shopifyPageMetaobjects,
} from "@/data/shopify/metaobjects/pages";
import { seoMetaobjectFieldKeys } from "@/data/shopify/metaobjects/seo";

export const productsPageQuery = `
  query ProductsPageMetaobject($type: String!, $handle: String!) {
    metaobject(handle: { type: $type, handle: $handle }) {
      id
      type
      handle
      fields {
        key
        value
        type
        reference {
          __typename
          ... on Metaobject {
            fields {
              key
              value
              type
            }
          }
        }
        references(first: 50) {
          nodes {
            __typename
            ... on Product {
              id
              handle
              title
              description
              availableForSale
              variants(first: 1) {
                nodes {
                  id
                  availableForSale
                }
              }
              productType
              cardSpecsMetafield: metafield(
                namespace: "custom"
                key: "product_card_specs_list"
              ) {
                type
                value
                reference {
                  __typename
                  ... on Metaobject {
                    id
                    type
                    handle
                    fields {
                      key
                      value
                      type
                    }
                  }
                }
              }
              subtitleMetafield: metafield(
                namespace: "custom"
                key: "product_subtitle"
              ) {
                type
                value
              }
              featuredImage {
                url
                altText
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
    detailPages: metaobjects(type: "${shopifyPageMetaobjects.productDetailsPage.type}", first: 50) {
      nodes {
        handle
        fields {
          key
          value
          type
          reference {
            __typename
            ... on Product {
              handle
              title
            }
            ... on Metaobject {
              handle
              type
              fields {
                key
                value
                type
              }
            }
          }
        }
      }
    }
  }
`;

export async function getProductsPageData(): Promise<ProductsPageData> {
  if (isShopifyDataSource()) {
    return getShopifyProductsPageData();
  }

  return getMockProductsPageData();
}

function getMockProductsPageData(): ProductsPageData {
  return {
    textContentBlock: productsPageIntroMockData,
    items: productBasicMockData.map(mapProductBasicToListItem),
  };
}

async function getShopifyProductsPageData(): Promise<ProductsPageData> {
  const data = await storefrontQuery<ShopifyProductsPageQueryData>(
    productsPageQuery,
    {
      type: shopifyPageMetaobjects.productsPage.type,
      handle: shopifyPageMetaobjects.productsPage.handle,
    },
  );

  if (!data.metaobject) {
    throw new Error("Products page metaobject was not found in Shopify");
  }

  const introField = data.metaobject.fields.find(
    (field) => field.key === productsPageFieldKeys.introTextContentBlock,
  );
  const productsField = data.metaobject.fields.find(
    (field) => field.key === productsPageFieldKeys.productsList,
  );
  const detailPageHandles = getDetailPageProductHandles(data.detailPages.nodes);
  const detailPageSpecs = getDetailPageSpecs(data.detailPages.nodes);

  return {
    seo: mapPageSeo(
      getMetaobjectFields(data.metaobject.fields, seoMetaobjectFieldKeys.reference),
    ),
    textContentBlock: mapTextContentBlockReference(
      introField,
      productsPageIntroMockData,
    ),
    items: mapProductsPageItems(
      productsField,
      detailPageHandles,
      detailPageSpecs,
    ),
  };
}
