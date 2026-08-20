import assert from "node:assert/strict";
import test from "node:test";

import type { ProductSummary } from "@/types/products";
import type { ShopifyMetaobjectNode } from "@/types/shopify";
import { mapProductDetailsMetaobject } from "./product-detail.ts";

const product: ProductSummary = {
  slug: "test-product",
  hasDetails: true,
  availableForSale: true,
  categoryLabel: "Effects unit",
  title: "Test product",
  subtitle: "",
  description: "",
  image: { src: "/fallback.jpg", alt: "Fallback" },
  price: "100",
  priceSubtitle: "EUR",
  specs: [],
};

test("image specs map Shopify titles to headings and text to descriptions", () => {
  const metaobject: ShopifyMetaobjectNode = {
    handle: "test-product-details",
    fields: [
      {
        key: "image_specs_horizontal",
        value: null,
        type: "metaobject_reference",
        references: null,
        reference: {
          __typename: "Metaobject",
          fields: [
            {
              key: "large_image",
              value: null,
              type: "file_reference",
              reference: {
                __typename: "MediaImage",
                image: {
                  url: "https://cdn.example.com/product.jpg",
                  altText: "Product controls",
                },
              },
            },
            {
              key: "specs_titles",
              value: JSON.stringify(["Controls"]),
              type: "list.single_line_text_field",
            },
            {
              key: "specs_text",
              value: JSON.stringify(["Responsive tone shaping"]),
              type: "list.single_line_text_field",
            },
          ],
        },
      },
    ],
  };

  const result = mapProductDetailsMetaobject(metaobject, product);

  assert.deepEqual(result.imageSpecsSections[0]?.specs, [
    { label: "Responsive tone shaping", value: "Controls" },
  ]);
});
