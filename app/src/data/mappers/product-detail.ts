import type {
  ProductDetailContentData,
  ProductHighlightsSectionData,
  ProductImageSpecsSectionData,
  ProductSpecsSectionData,
  ProductSummary,
} from "@/types/products";
import type {
  ShopifyMediaImageReference,
  ShopifyMetaobjectNode,
  ShopifyMetaobjectReference,
  ShopifyScalarMetaobjectField,
} from "@/types/shopify";
import { productComponentFieldKeys } from "@/data/shopify/metaobjects/components";
import { mapMediaImageReference } from "./media";
import { mapProductCardSpecs, mapSpecsFromMetaobjectFields } from "./product-primitives";
import {
  getMetaobjectFieldReference,
  getMetaobjectTextValue,
  parseStringList,
} from "./shopify";
import { mapTextContentBlockFields } from "./text-content-block";

export function mapProductDetailsMetaobject(
  metaobject: ShopifyMetaobjectNode,
  product: ProductSummary,
): ProductDetailContentData {
  const fields = metaobject.fields;

  const heroImage =
    mapMediaImageReference(
      getMetaobjectFieldReference<ShopifyMediaImageReference>(
        fields,
        productComponentFieldKeys.detailHeroImage,
        "MediaImage",
      ),
      `${product.title} hero image`,
    ) || product.image;

  const largeImage = mapMediaImageReference(
    getMetaobjectFieldReference<ShopifyMediaImageReference>(
      fields,
      productComponentFieldKeys.detailLargeImage,
      "MediaImage",
    ),
    `${product.title} detail image`,
  );

  const largeImage2 = mapMediaImageReference(
    getMetaobjectFieldReference<ShopifyMediaImageReference>(
      fields,
      productComponentFieldKeys.detailLargeImage2,
      "MediaImage",
    ),
    `${product.title} secondary detail image`,
  );

  const keySpecs = mapMetaobjectSpecsSection(
    getMetaobjectFieldReference<ShopifyMetaobjectReference>(
      fields,
      productComponentFieldKeys.detailKeySpecs,
      "Metaobject",
    )?.fields,
    "Key specs",
    3,
  );

  const highlights = mapProductHighlights(fields);
  const horizontalSection = mapImageSpecsSection(
    getMetaobjectFieldReference<ShopifyMetaobjectReference>(
      fields,
      productComponentFieldKeys.horizontalImageSpecs,
      "Metaobject",
    ),
    "horizontal",
    `${product.title} horizontal specs image`,
  );
  const verticalSection = mapImageSpecsSection(
    getMetaobjectFieldReference<ShopifyMetaobjectReference>(
      fields,
      productComponentFieldKeys.verticalImageSpecs,
      "Metaobject",
    ),
    "vertical",
    `${product.title} vertical specs image`,
  );

  return {
    slug: product.slug,
    heroImage,
    textContentBlock: mapTextContentBlockFields(
      getMetaobjectFieldReference<ShopifyMetaobjectReference>(
        fields,
        productComponentFieldKeys.detailTextContent,
        "Metaobject",
      )?.fields,
    ),
    textContentBlock2: mapTextContentBlockFields(
      getMetaobjectFieldReference<ShopifyMetaobjectReference>(
        fields,
        productComponentFieldKeys.detailTextContent2,
        "Metaobject",
      )?.fields,
    ),
    largeImage,
    largeImage2,
    keySpecs,
    highlights,
    imageSpecsSections: [horizontalSection, verticalSection].filter(
      (section): section is ProductImageSpecsSectionData => Boolean(section),
    ),
  };
}

function mapProductHighlights(
  fields: ShopifyMetaobjectNode["fields"],
): ProductHighlightsSectionData | undefined {
  const highlightItems = parseStringList(
    getMetaobjectTextValue(fields, productComponentFieldKeys.detailHighlights),
  ).slice(0, 4);

  if (highlightItems.length === 0) {
    return undefined;
  }

  return {
    title: "Highlights",
    items: highlightItems,
  };
}

function mapMetaobjectSpecsSection(
  fields: ShopifyScalarMetaobjectField[] | undefined,
  title: string,
  limit?: number,
): ProductSpecsSectionData | undefined {
  if (!fields?.length) {
    return undefined;
  }

  const specs = mapProductCardSpecs(fields, limit);

  if (specs.length === 0) {
    return undefined;
  }

  return {
    title,
    specs,
  };
}

function mapImageSpecsSection(
  metaobject: ShopifyMetaobjectReference | undefined,
  layout: ProductImageSpecsSectionData["layout"],
  fallbackAlt: string,
): ProductImageSpecsSectionData | undefined {
  const fields = metaobject?.fields;

  if (!fields?.length) {
    return undefined;
  }

  const image = mapMediaImageReference(
    getMetaobjectFieldReference<ShopifyMediaImageReference>(
      fields,
      productComponentFieldKeys.imageSpecsImage,
      "MediaImage",
    ),
    fallbackAlt,
  );

  const specs = mapSpecsFromMetaobjectFields(
    fields,
    productComponentFieldKeys.imageSpecsTexts,
    productComponentFieldKeys.imageSpecsTitles,
    4,
  );

  if (!image || specs.length === 0) {
    return undefined;
  }

  return {
    image,
    specs,
    layout,
  };
}
