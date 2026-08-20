import { productBasicDataBySlug } from "@/data/mock/products/product-basic";
import { productCustomizationCardDataBySlug } from "@/data/mock/products/customization-card";
import { productPageDataBySlug } from "@/data/mock/products/product-page";
import {
  getMetaobjectFields,
  getReferencedProductFromDetailPage,
  mapPageSeo,
  mapProductDetailsMetaobject,
  mapStorefrontProductToListItem,
} from "@/data/mappers";
import { storefrontQuery } from "@/data/shopify/storefront-client";
import type {
  ShopifyProductDetailPagesQueryData,
} from "@/types/shopify";
import { isShopifyDataSource } from "@/data/source";
import type { ProductDetailPageData } from "@/types/products";
import { shopifyPageMetaobjects } from "@/data/shopify/metaobjects/pages";
import { seoMetaobjectFieldKeys } from "@/data/shopify/metaobjects/seo";

const ctaLabel = "Buy";

export const productDetailPagesQuery = `
  query ProductDetailPages {
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
            ... on Metaobject {
              handle
              type
              fields {
                key
                value
                type
                reference {
                  __typename
                  ... on MediaImage {
                    image {
                      url
                      altText
                    }
                  }
                }
              }
            }
            ... on MediaImage {
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

export async function getProductDetailPageData(
  slug: string,
): Promise<ProductDetailPageData | undefined> {
  if (isShopifyDataSource()) {
    return getShopifyProductDetailPageData(slug);
  }

  return getMockProductDetailPageData(slug);
}

function getMockProductDetailPageData(
  slug: string,
): ProductDetailPageData | undefined {
  const product = productBasicDataBySlug[slug];
  const detail = productPageDataBySlug[slug];
  const customization = productCustomizationCardDataBySlug[slug];

  if (!product || !detail) {
    return undefined;
  }

  return {
    product,
    detail,
    customization,
    ctaLabel,
  };
}

async function getShopifyProductDetailPageData(
  slug: string,
): Promise<ProductDetailPageData | undefined> {
  const data = await storefrontQuery<ShopifyProductDetailPagesQueryData>(
    productDetailPagesQuery,
  );

  const detailPage = data.detailPages.nodes.find(
    (node) => getReferencedProductFromDetailPage(node)?.handle === slug,
  );

  const productReference = detailPage
    ? getReferencedProductFromDetailPage(detailPage)
    : undefined;

  if (!detailPage || !productReference) {
    return undefined;
  }

  const product = mapStorefrontProductToListItem(productReference, true);

  return {
    seo: mapPageSeo(
      getMetaobjectFields(detailPage.fields, seoMetaobjectFieldKeys.reference),
    ),
    product,
    detail: mapProductDetailsMetaobject(detailPage, product),
    customization: undefined,
    ctaLabel,
  };
}
