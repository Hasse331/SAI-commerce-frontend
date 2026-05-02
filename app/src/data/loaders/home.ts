import {
  getMediaImageReference,
  getMediaReference,
  getMetaobjectFields,
  mapContentBoxes,
  mapMediaReference,
  mapMediaImageReference,
  mapPageSeo,
  mapProcessSteps,
  mapQuote,
  mapTextContentBlockFields,
} from "@/data/mappers";
import { storefrontQuery } from "@/data/shopify/storefront-client";
import type { ShopifyMetaobjectField } from "@/types/shopify";
import { isShopifyDataSource } from "@/data/source";
import type { HomePageData } from "@/types/home";
import { homeHeroCtaContent } from "../contents/home-hero-cta";
import {
  homeContentBoxesFallbackData,
  homeLargeMedia1FallbackData,
  homeLargeMedia2FallbackData,
  homeProcessStepsFallbackData,
  homeQuoteFallbackData,
  homeTextContentBlock1FallbackData,
  homeTextContentBlock2FallbackData,
} from "../fallback/home-page-fallback";
import { getBrandData } from "./brand-loader";
import {
  homePageFieldKeys,
  shopifyPageMetaobjects,
} from "../shopify/metaobjects/pages";
import {
  homeContentBoxesMockData,
  homeIntroMockData,
  homeLargeImage2MockData,
  homeLargeImageMockData,
  homeProcessStepsMockData,
  homeQuoteMockData,
} from "../mock/home-page";
import { seoMetaobjectFieldKeys } from "../shopify/metaobjects/seo";

interface ShopifyHomePageQueryData {
  metaobjects: {
    nodes: Array<{
      handle: string;
      fields: ShopifyMetaobjectField[];
    }>;
  };
}

const homePageQuery = `
  query HomePage {
    metaobjects(type: "${shopifyPageMetaobjects.homePage.type}", first: 1) {
      nodes {
        handle
        fields {
          key
          value
          type
          reference {
            __typename
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
            ... on Video {
              alt
              previewImage {
                url
                altText
              }
              sources {
                url
                mimeType
                format
              }
            }
          }
        }
      }
    }
  }
`;

export async function getHomePageData(): Promise<HomePageData> {
  if (isShopifyDataSource()) {
    return getShopifyHomePageData();
  }

  return getMockHomePageData(await getBrandData());
}

function getMockHomePageData(
  brand: Awaited<ReturnType<typeof getBrandData>>,
): HomePageData {
  return {
    hero: {
      title: brand.name,
      subtitle: brand.slogan,
      ...homeHeroCtaContent,
    },
    textContentBlock1: homeIntroMockData,
    contentBoxes: homeContentBoxesMockData,
    largeMedia1: homeLargeImageMockData,
    textContentBlock2: homeIntroMockData,
    largeMedia2: homeLargeImage2MockData,
    processSteps: homeProcessStepsMockData,
    quote: homeQuoteMockData,
  };
}

function getFallbackHomePageData(
  brand: Awaited<ReturnType<typeof getBrandData>>,
): HomePageData {
  return {
    hero: {
      title: brand.name,
      subtitle: brand.slogan,
      ...homeHeroCtaContent,
    },
    textContentBlock1: homeTextContentBlock1FallbackData,
    contentBoxes: homeContentBoxesFallbackData,
    largeMedia1: homeLargeMedia1FallbackData,
    textContentBlock2: homeTextContentBlock2FallbackData,
    largeMedia2: homeLargeMedia2FallbackData,
    processSteps: homeProcessStepsFallbackData,
    quote: homeQuoteFallbackData,
  };
}

async function getShopifyHomePageData(): Promise<HomePageData> {
  const brand = await getBrandData();
  const fallback = getFallbackHomePageData(brand);
  const data = await storefrontQuery<ShopifyHomePageQueryData>(homePageQuery);
  const homePage = data.metaobjects.nodes[0];

  if (!homePage) {
    return fallback;
  }

  const fields = homePage.fields;

  return {
    seo: mapPageSeo(getMetaobjectFields(fields, seoMetaobjectFieldKeys.reference)),
    hero: {
      title: brand.name,
      subtitle: brand.slogan,
      ...homeHeroCtaContent,
      backgroundImage:
        mapMediaImageReference(
          getMediaImageReference(fields, homePageFieldKeys.heroImage),
          "Home hero image",
        )?.src || fallback.hero.backgroundImage,
    },
    textContentBlock1:
      mapTextContentBlockFields(
        getMetaobjectFields(fields, homePageFieldKeys.textContent1),
        fallback.textContentBlock1,
      ) ?? fallback.textContentBlock1,
    contentBoxes: mapContentBoxes(
      getMetaobjectFields(fields, homePageFieldKeys.contentBoxes),
      fallback.contentBoxes,
    ),
    largeMedia1:
      mapMediaReference(
        getMediaReference(fields, homePageFieldKeys.largeMedia1),
        "Home large media 1",
      ) || fallback.largeMedia1,
    textContentBlock2:
      mapTextContentBlockFields(
        getMetaobjectFields(fields, homePageFieldKeys.textContent2),
        fallback.textContentBlock2,
      ) ?? fallback.textContentBlock2,
    largeMedia2:
      mapMediaReference(
        getMediaReference(fields, homePageFieldKeys.largeMedia2),
        "Home large media 2",
      ) || fallback.largeMedia2,
    processSteps: mapProcessSteps(
      getMetaobjectFields(fields, homePageFieldKeys.processSteps),
      fallback.processSteps,
    ),
    quote: mapQuote(
      getMetaobjectFields(fields, homePageFieldKeys.quote),
      fallback.quote,
    ),
  };
}
